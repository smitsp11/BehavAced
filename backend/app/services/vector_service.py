"""
Vector Search Service - Semantic search and clustering for resume data
"""
from typing import List, Dict, Any, Optional
import numpy as np
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity


class VectorService:
    """Service for vector-based semantic search and matching"""
    
    def __init__(self):
        self.embedder = SentenceTransformer('all-MiniLM-L6-v2')
    
    def find_similar_experiences(
        self,
        query: str,
        work_experience_embeddings: List[Dict[str, Any]],
        top_k: int = 3,
        threshold: float = 0.5
    ) -> List[Dict[str, Any]]:
        """
        Find similar work experiences to a query using vector similarity
        
        Args:
            query: Search query (e.g., "led a team", "solved a bug")
            work_experience_embeddings: List of role embeddings from resume parser
            top_k: Number of results to return
            threshold: Minimum similarity threshold
        
        Returns:
            List of similar experiences with similarity scores
        """
        if not work_experience_embeddings:
            return []
        
        # Embed query
        query_embedding = self.embedder.encode([query], convert_to_numpy=True)
        
        results = []
        
        for role_data in work_experience_embeddings:
            role_embeddings = np.array(role_data['embeddings'])
            texts = role_data['texts']
            
            # Calculate similarity for each accomplishment in the role
            similarities = cosine_similarity(query_embedding, role_embeddings)[0]
            
            # Get top matches within this role
            top_indices = np.argsort(similarities)[::-1][:top_k]
            
            for idx in top_indices:
                similarity = float(similarities[idx])
                if similarity >= threshold:
                    results.append({
                        "role_title": role_data['role_title'],
                        "company": role_data['company'],
                        "accomplishment": texts[idx],
                        "similarity": similarity,
                        "match_type": "work_experience"
                    })
        
        # Sort by similarity and return top_k
        results.sort(key=lambda x: x['similarity'], reverse=True)
        return results[:top_k]
    
    def cluster_experiences_by_theme(
        self,
        work_experience_embeddings: List[Dict[str, Any]],
        n_clusters: Optional[int] = None
    ) -> Dict[str, List[Dict[str, Any]]]:
        """
        Cluster work experiences by semantic similarity (themes)
        
        Common themes: leadership, problem-solving, technical achievement, collaboration
        """
        from sklearn.cluster import KMeans
        
        if not work_experience_embeddings:
            return {}
        
        # Collect all accomplishment embeddings
        all_embeddings = []
        all_metadata = []
        
        for role_data in work_experience_embeddings:
            for i, embedding in enumerate(role_data['embeddings']):
                all_embeddings.append(embedding)
                all_metadata.append({
                    "role_title": role_data['role_title'],
                    "company": role_data['company'],
                    "text": role_data['texts'][i]
                })
        
        if not all_embeddings:
            return {}
        
        # Determine number of clusters
        if n_clusters is None:
            n_clusters = min(5, len(all_embeddings) // 2)  # Adaptive clustering
        
        if n_clusters < 2:
            return {"cluster_0": all_metadata}
        
        # Perform clustering
        embeddings_array = np.array(all_embeddings)
        kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
        cluster_labels = kmeans.fit_predict(embeddings_array)
        
        # Group by cluster
        clusters = {}
        for idx, label in enumerate(cluster_labels):
            cluster_key = f"cluster_{label}"
            if cluster_key not in clusters:
                clusters[cluster_key] = []
            clusters[cluster_key].append(all_metadata[idx])
        
        return clusters
    
    def match_skills_to_experiences(
        self,
        skill: str,
        work_experience_embeddings: List[Dict[str, Any]],
        threshold: float = 0.4
    ) -> List[Dict[str, Any]]:
        """
        Match a skill to relevant work experiences using semantic similarity
        """
        query = f"used {skill} to"
        return self.find_similar_experiences(
            query,
            work_experience_embeddings,
            top_k=5,
            threshold=threshold
        )
    
    def find_story_candidates(
        self,
        question_theme: str,
        work_experience_embeddings: List[Dict[str, Any]],
        top_k: int = 3
    ) -> List[Dict[str, Any]]:
        """
        Find best story candidates for a behavioral question theme
        
        Args:
            question_theme: Theme of the question (e.g., "leadership", "conflict resolution")
            work_experience_embeddings: Embedded work experiences
            top_k: Number of candidates to return
        
        Returns:
            List of story candidates ranked by relevance
        """
        # Enhance query with context
        enhanced_query = f"experience about {question_theme} with measurable impact"
        
        return self.find_similar_experiences(
            enhanced_query,
            work_experience_embeddings,
            top_k=top_k,
            threshold=0.3  # Lower threshold for story matching
        )


# Global instance
vector_service = VectorService()

