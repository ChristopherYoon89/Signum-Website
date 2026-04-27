import React, { useState, useEffect, useRef } from 'react';
import {
	Card,
	Row,
	Col,
	Layout,
	Tooltip,
	Divider,
	Popover,
	Button,
	Tag,
  } from 'antd';
import 'antd/dist/antd.min.css';
import {
	SyncOutlined,
	RightOutlined,
	LeftOutlined,
	PlusOutlined,
	StarOutlined,
	StockOutlined,
	ToolOutlined,
	ControlOutlined,
} from '@ant-design/icons';
import Axios from "axios";
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthProvider.js";
import ArticleStatsPopOverContent from './StatsNewsArticle.js';
import moment from 'moment';
import DashboardBookmarkFeedPopover from './DashboardBookmarkFeedPopover.js';


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


const DashboardFeedBoardApp = () => {
	const [feeds, setFeeds] = useState([]);
	const [loading, setLoading] = useState(true);
	const scrollContainerRef = useRef(null);
	const [userbookmarks, setUserBookmarks] = useState([]); 
	const [userfollows, setUserFollows] = useState([]);
	const { isauthenticated, user, usersettings } = useAuth();

	const navigate = useNavigate();

	useEffect(() => {
		if (!isauthenticated) {
			setUserBookmarks([]);
			return;
		};
		
		const fetchUserBookmarks = async () => {
			try {
				const response = await Axios.get(`/api/UserBookmarks/`);
				const bookmarks = response.data.map(row => row.newsarticle_bookmarked);
				setUserBookmarks(bookmarks);
			} catch (error) {
				console.error("Failed to fetch user bookmarks");
			}
		};
		fetchUserBookmarks();
	}, [isauthenticated]);


	useEffect(() => {
		if (!isauthenticated) {
			setUserFollows([]);
			return;
		}
		const fetchUserFollows = async () => {
			try {
				const response = await Axios.get(`/api/SourceUserFollowsAll/`);
				const follows = response.data.map(row => row.source);
				setUserFollows(follows);
			} catch(error) {
				console.error("Failed to fetch user follows");
			}
		};
		fetchUserFollows();
	}, [isauthenticated]);


	const toggleUserFollow = async (source_id) => {
		if (!isauthenticated) {
			return;
		};

		const isFollowed = userfollows.includes(source_id)
		setUserFollows(prev =>
			isFollowed 
				? prev.filter(id => id !== source_id)
				: [...prev, source_id]
		);
		try {
			const response = await Axios.post(`/api/SourceUserFollowToggle/`,
				{ source: source_id,	},
				{ headers: { 'X-CSRFToken': csrftoken } }
			);
			if (response.data.message === 'Follow removed' && !isFollowed) {
				setUserFollows(prev => [...prev, source_id]);
			} else if (response.data.message !== "Follow removed" && isFollowed) {
				setUserFollows(prev => prev.filter(id => id !== source_id));
			}
		} catch (error) {
			const status = error.response?.status;
			if (status === 401 || status === 403) {
			message.info("Please log in to follow sources");
		} else {
			console.error("Failed to follow source");
			message.error("Something went wrong");
		}
		}
	};


	const createClick = async (record) => {
		try {
			const response = await Axios.post(`/api/UserClick/`,
				{ newsarticle: Number(record.id) },
				{ 
					withCredentials: true,
					headers: { 'X-CSRFToken': csrftoken } 
				}
			);
		} catch (error) {
			console.error("Failed to post click");
		}
	};


	useEffect(() => {
		setLoading(true);

		const getFeeds = async () => {
			try {
				const response = await axios.get(`/api/board-feeds/`);

				const feedsWithState = response.data.map(feed => ({
					...feed,
					page: feed.page || 1,
					hasMore: feed.has_more,
					loadingMore: false,
				}));

				setFeeds(feedsWithState);
			} catch (error) {
				console.error("Failed to fetch feeds");
			} finally {
				setLoading(false);
			}
		};

		getFeeds();
	}, []);


	const loadMoreArticles = async (feedId) => {
		setFeeds(prevFeeds =>
			prevFeeds.map(feed =>
				feed.id === feedId ? { ...feed, loadingMore: true } : feed
			)
		);

		const feed = feeds.find(f => f.id === feedId);
		if (!feed || !feed.hasMore) return;

		try {
			const nextPage = feed.page + 1;
			const response = await axios.get(`/api/board-feeds-single/?feed_id=${feedId}&page=${nextPage}`);
			const newArticles = response.data.articles;

			setFeeds(prevFeeds =>
				prevFeeds.map(f =>
					f.id === feedId
						? {
								...f,
								articles: [...f.articles, ...newArticles],
								page: nextPage,
								hasMore: response.data.has_more,
								loadingMore: false
							}
						: f
				)
			);
		} catch (error) {
			console.error(`Failed to load more articles for feed`);
			setFeeds(prevFeeds =>
				prevFeeds.map(f =>
					f.id === feedId && f.id === feedId ? { ...f, loadingMore: false } : f
				)
			);
		}
	};



	const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 360, behavior: 'smooth' }); // scroll by column width + gutter
    }
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -360, behavior: 'smooth' });
    }
  };


	return (
		<>
		<Layout>
		<Card
			style={{ borderColor: '#FFF', }}
			bodyStyle={{ paddingTop: 10, paddingLeft: 10, }}
			>
			{loading ? (
        <div style={{ 
					display: 'flex', 
					justifyContent: 'center', 
					alignItems: 'center', 
					height: 650, 
					width: '100%', 
					textAlign: 'center'
				  }}
				>
				<SyncOutlined spin style={{color: "#5e5e5e", fontSize: 24,}}/>
				</div>
				) : (
				<Layout className='dashboard-feed-board-layout'>
				<Row gutter={[15, 15]} style={{
					height: "100%",
					flex: 1,
					minHeight: 0
				}}>
				<LeftOutlined
					onClick={scrollLeft}
					style={{
						position: 'absolute',
						left: 0,
						top: '50%',
						zIndex: 10,
						transform: 'translateY(-50%)',
						fontSize: 12,
						cursor: 'pointer',
						background: '#fff',
						borderRadius: '50%',
						padding: '8px',
						boxShadow: '0 0 6px rgba(0,0,0,0.2)'
					}}
				/>
				<div className='dashboard-feed-board-scroll-container' ref={scrollContainerRef}>
					{feeds.map((feed, index) => (
						<Col key={index} xs={24} sm={12} md={8} style={{ display: "flex", flexDirection: "column", minHeight: 0, }}>
							<p className="dashboard-feed-board-title">
								<Tag color={"red"}><ControlOutlined color={"red"} style={{marginRight: 5, }}/>{feed.title}</Tag>
									{feed.feed_type === "personal_feed" && (
										<Tooltip title="Edit feed" placement="top">
											<span
												onClick={() => navigate(`/dashboard/briefing/editfeed/${feed.id}`)}
											>
												<ToolOutlined
													style={{
														fontSize: 16,
														color: "#969696",
														cursor: 'pointer',
													}}
												/>
											</span>
										</Tooltip>
									)}
								</p>
							<Card className="scrollable-menu" style={{ flex: 1, minHeight: 0, overflowY: 'auto', overflowX: 'auto', }}>
								{feed.articles.length > 0 ? (
									feed.articles.map((article, i) => (
										<div className="dashboard-feed-board-article" key={i} style={{ marginBottom: '12px' }}>
											<p className="briefing-source-row">
												<span className="home-source-left">
													<span
														onClick={() => navigate(`/dashboard/source/${encodeURIComponent(article.source_name)}?scrollToTop=true`)}
														className="home-source"
													>
													{article.source_name}
													</span>

													<span>
														<Tooltip
															title={
																!isauthenticated
																	? "Log in to follow source"
																	: userfollows.includes(article.source_id)
																		? "Unfollow"
																		: "Follow"
															}
														>
														<PlusOutlined
															style={{
																marginLeft: 5,
																fontSize: 12,
																cursor: 'pointer', 
																color: !isauthenticated
																	? "#444"
																	: userfollows.includes(article.source_id)
																		? "#ff0000"
																		: "#868686",
															}}
															onClick={
																isauthenticated
																?	() => toggleUserFollow(article.source_id)
																: undefined
															}
														/>
														</Tooltip>
														</span>
														</span>

														<div className="home-source-right">
														<Tooltip
															title={
																!isauthenticated
																	? "Log in to bookmark article"
																	: userbookmarks.includes(article.id)
																	? "Remove"
																	: "Add bookmark"
															}
														>
														<Popover 
															placement="right"
															content={<DashboardBookmarkFeedPopover
																article={article}
																setUserBookmarks={setUserBookmarks}
																/>}
															trigger='click'
															color="rgba(26, 26, 26, 0.9)"
														>
														<StarOutlined
															className="antd-home-icon"
															style={{
																marginLeft: 10,
																cursor: 'pointer',
																color: !isauthenticated
																	? "#868686"
																	: userbookmarks.includes(article.id)
																		? "#ffac00"
																		: "#868686",
															}}
														/>
														</Popover>
														</Tooltip>
														<Popover
															placement="right"
															content={<ArticleStatsPopOverContent record={article} />} 
															trigger='click'
															color="rgba(26, 26, 26, 0.9)"
															>
															<Tooltip
															title={"Article stats"}
															>
															<StockOutlined
																className="antd-home-icon"
																style={{ marginLeft: 10, color: "#868686" }} />
															</Tooltip>
														</Popover>
													</div>
												</p>
												<span 
												className="table-title"
												onClick={() => createClick(article)}
												>
												<a href={article.source_url} target="_blank">
													<strong>{article.title}</strong>
												</a>
												</span>
												<div style={{marginTop: 10,  }}>
													{ usersettings.show_article_tags && (
														<>
														<span 
															onClick={(e) => {
																navigate(`/dashboard/tag/${encodeURIComponent(article.tag1)}?scrollToTop=true`);
																}}
															>
														<Tag className="table-tag" color={"purple"}>{article.tag1}</Tag>
														</span>
														<span
															onClick={(e) => {
																navigate(`/dashboard/tag/${encodeURIComponent(article.tag2)}?scrollToTop=true`);
																}}
															>
														<Tag className="table-tag" color={"green"}>{article.tag2}</Tag>
														</span>
														<span
															onClick={(e) => {
																navigate(`/dashboard/tag/${encodeURIComponent(article.tag3)}?scrollToTop=true`);
																}}
															>
														<Tag className="table-tag" color={"blue"}>{article.tag3}</Tag>
														</span>
														</>
													)
												}

													{ usersettings.show_article_timestamp && (
															<>
															<span className="ant-home-date">
																{moment(article.date_posted).fromNow()}
															</span>
															</>
														)}
												</div>
												
											<Divider />	
											
	
											</div>
										
										)
									)
									) : (
										<p>No articles found</p>
									)}
									{feed.hasMore && (
												<div style={{ textAlign: 'center', marginTop: 10 }}>
													<Button
														onClick={() => loadMoreArticles(feed.id)}
														loading={feed.loadingMore}
													>
														Load More
													</Button>
												</div>
											)}
											</Card>
										</Col>
									))}
									</div>

						<RightOutlined
							onClick={scrollRight}
							style={{
								position: 'absolute',
								right: 0,
								top: '50%',
								zIndex: 10,
								transform: 'translateY(-50%)',
								fontSize: 12,
								cursor: 'pointer',
								background: '#fff',
								borderRadius: '50%',
								padding: '8px',
								boxShadow: '0 0 6px rgba(0,0,0,0.2)'
							}}
						/>
				</Row>
				</Layout>	
				)}
				</Card>
			</Layout>
		</>
	)
}
export default DashboardFeedBoardApp;


