// src/components/LikeButton.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';

const LikeButton = () => {
    const [likes, setLikes] = useState(0);
    const [hasLiked, setHasLiked] = useState(false);
    const [loading, setLoading] = useState(false);

    const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080';

    useEffect(() => {
        // Fetch current likes
        axios.get(`${API_URL}/api/likes`)
            .then(res => setLikes(res.data.totalLikes))
            .catch(err => console.error('Failed to fetch likes', err));

        const liked = localStorage.getItem('hasLikedSite');
        if (liked) setHasLiked(true);
    }, [API_URL]);

    const handleLike = async () => {
        if (hasLiked || loading) return;

        setLoading(true);
        try {
            const res = await axios.post(`${API_URL}/api/likes`);
            setLikes(res.data.totalLikes);
            setHasLiked(true);
            localStorage.setItem('hasLikedSite', 'true');
        } catch (err) {
            console.error('Like failed', err);
            alert('Failed to like. Try again!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleLike}
            disabled={hasLiked || loading}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${hasLiked
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                }`}
            title={hasLiked ? "Thanks for liking!" : "Like this site"}
        >
            ❤️
            <span className="font-semibold">{likes}</span>
            {hasLiked ? 'Thanks!' : 'Like'}
        </button>
    );
};

export default LikeButton;