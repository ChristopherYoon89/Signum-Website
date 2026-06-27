import { useEffect, useState } from 'react';
import axios from 'axios';
import { getCookie } from './ManagerUtility';


var csrftoken = getCookie('csrftoken');


export const useBookmarks = () => {
	const [userbookmarks, setUserBookmarks] = useState([]);

	useEffect(() => {
		fetchUserBookmarks();
	}, []);

	const fetchUserBookmarks = async () => {
		try {
			const response = await axios.get(`/api/UserBookmarks/`);
			const bookmarks = response.data.map(row => row.newsarticle_bookmarked);
			setUserBookmarks(bookmarks);
		} catch (error) {
			console.error(`Failed to fetch user bookmarks`, error);
		}
	};

	return {
		userbookmarks,
		setUserBookmarks
	}
};



export const useSourceFollow = () => {
	const [userfollows, setUserFollows] = useState([]);

	useEffect(() => {
		fetchUserFollows();
	}, []);

	const fetchUserFollows = async () => {
		try {
			const response = await axios.get(`/api/SourceUserFollowsAll/`);
			const follows = response.data.map(row => row.source);
			setUserFollows(follows);
		} catch(error) {
			console.error("Failed to fetch user follows");
		}
	};

	const toggleUserFollow = async (source_id) => {
			const isFollowed = userfollows.includes(source_id)
	
			setUserFollows(prev =>
				isFollowed 
					? prev.filter(id => id !== source_id)
					: [...prev, source_id]
			);
	
			try {
				const response = await axios.post(`/api/SourceUserFollowToggle/`,
					{ source: source_id },
					{ headers: { 'X-CSRFToken': csrftoken } }
				);
	
				if (response.data.message === 'Follow removed' && !isFollowed) {
					setUserFollows(prev => [...prev, source_id]);
				} else if (response.data.message !== "Follow removed" && isFollowed) {
					setUserFollows(prev => prev.filter(id => id !== source_id));
				}
			} catch (error) {
				console.error("Failed to follow source", error);
			}
		};

	return {
		userfollows,
		toggleUserFollow
	}
}


