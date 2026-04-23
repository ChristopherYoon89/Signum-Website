import React, {useState, useEffect} from 'react';
import { 
	Checkbox,
	Divider,
	Input,
	Button,
 } from 'antd';
import Axios from "axios";
import axios from 'axios';
import { useAuth } from './AuthProvider.js';


function getCookie(name) {
  var cookieValue = null;
  if (document.cookie && document.cookie !== '') {
      var cookies = document.cookie.split(';');
      for (var i = 0; i < cookies.length; i++) {
          var cookie = cookies[i].toString().replace(/^([\s]*)|([\s]*)$/g, ""); 
          if (cookie.substring(0, name.length + 1) === (name + '=')) {
              cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
              break;
          }
      }
  }
  return cookieValue;
}


var csrftoken = getCookie('csrftoken');


const DashboardBookmarkFeedPopover = ({ article, setUserBookmarks }) => {
	const { isauthenticated, user } = useAuth();
	const [listoffeeds, setListOfFeeds] = useState([]);
	const [feedtitle, setFeedTitle] = useState('');
	const [userfeedlistbookmarked, setUserFeedListBookmarked] = useState([]);
	const [titleinputplaceholder, setTitleInputPlaceholder] = useState('Add new bookmark feed')
	const [titleinputstatus, setTitleInputStatus] = useState('');


	const onChangeFeedTitle = (value) =>{
		setTitleInputPlaceholder('Add new bookmark feed');
		setTitleInputStatus('');
		setFeedTitle(value);
	};


	useEffect(() => {
		if (!isauthenticated) {
			return;
			}
			fetchBookmarkFeeds();
	}, []);
	
	
	const fetchBookmarkFeeds = async () => {
		try {
			const response = await axios.get("/api/BookmarkFeedUser/");
			const mappeduserfeeds = response.data.map((row) => ({
				value: row.id,
				label: row.title,
			}));
			setListOfFeeds(mappeduserfeeds);
		} catch (error) {
			console.error("Failed to fetch user rating");
		}
	};


	useEffect(() => {
		if (!article.id) return;

		const fetchArticleFeeds = async () => {
			const res = await Axios.get(
				`/api/BookmarkNews/?newsarticle=${article.id}`
			);

			if (res.data.length > 0) {
				setUserFeedListBookmarked(res.data[0].feeds || []);
			} else {
				setUserFeedListBookmarked([]);
			}
		};

		fetchArticleFeeds();
	}, [article.id]);
		

	const addNewBookmarkFeed = async () => {
		if (!isauthenticated) return;

		const istitlevalid = feedtitle.length > 0
		if (!istitlevalid) {
			setTitleInputPlaceholder('Please enter a title');
			setTitleInputStatus('error');
			return;
		} else {
			setTitleInputPlaceholder('Add new bookmark feed');
			setTitleInputStatus('');
		}

		try {
			await axios.post('/api/BookmarkFeedUser/', 
			{
				title: feedtitle, 
			},
			{
				withCredentials: true,
				headers: { "X-CSRFToken": csrftoken }
			});

			fetchBookmarkFeeds();
			setFeedTitle('');

		} catch (error) {
			console.log("Error adding new bookmark feed");
		}
	};


	const toggleFeedBookmark = async (feedId) => {
		if (!article.id) return;

		setUserFeedListBookmarked(prev =>
			prev.includes(feedId)
				? prev.filter(id => id !== feedId)
				: [...prev, feedId]
		);

		try {
			const res = await Axios.post("/api/BookmarkNews/", {
				newsarticle_bookmarked: article.id,
				feed_id: feedId
			},{
				headers: { 'X-CSRFToken': csrftoken }
			});

			const feeds = (res.data.feeds || []).map(f =>
				typeof f === "object" ? f.id : f
			);

			setUserFeedListBookmarked(feeds);

			if (feeds.length > 0) {
				setUserBookmarks(prev =>
					prev.includes(article.id)
						? prev
						: [...prev, article.id]
				);
			} else {
				setUserBookmarks(prev =>
					prev.filter(id => id !== article.id)
				);
			}
		} catch (error) {
			console.error("Failed to toggle bookmark");
		}
	};


	return (
		<>
			<div className="bookmark-scroll-container">					
				<div className="bookmark-input-row">
					<Input 
						placeholder={titleinputplaceholder} 
						status={titleinputstatus}
						className="bookmark-input"
						value={feedtitle}
						onChange={(e) => onChangeFeedTitle(e.target.value)}
					/>
					<Button 
						type="primary" 
						size={'small'}
						onClick={addNewBookmarkFeed}
					>
					Add
					</Button>
				</div>
					
				<div className="scrollable-menu" style={{ maxHeight: '250px', overflowY: 'auto', }}>
				{
					listoffeeds.length > 0 ? (
						listoffeeds.map((feed, i) => (
							<>
								<Divider style={{ marginBottom: 0, marginTop: 0, borderColor: "#646464" }}	/>
								<p key={feed.value} style={{ marginTop: 10, }}>
									<Checkbox
										className="bookmark-checkbox"
										checked={userfeedlistbookmarked.includes(feed.value)}
										onChange={() => toggleFeedBookmark(feed.value)}
									>
									<span className="col-light-grey">{feed.label}</span>
									</Checkbox>
								</p>
							</>
						))
					) : null
				}
				<Divider style={{ marginBottom: 0, marginTop: 0, borderColor: "#646464" }} />
			</div>
		</div>
	</>
	);
};
export default DashboardBookmarkFeedPopover; 