import React, {useState, useEffect, useRef } from 'react';
import { 
	Layout,
	Popover,
	Tag,
	Row,
	Col,
	Tooltip,
	Divider,
	Card,
	Button,
	Empty,
 } from 'antd';
import {
StarOutlined, 
StockOutlined,
SyncOutlined,
PlusOutlined,
LeftOutlined,
RightOutlined,
ToolOutlined,
DeleteOutlined,
} from '@ant-design/icons';
import axios from "axios";
import moment from 'moment';
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthProvider.js";
import ArticleStatsPopOverContent from './StatsNewsArticle.js';
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


const CompNoBookmarkedArticles = ({ onNavigateAddBookmarkFeed }) => {
	return(
		<>
			<div className="nobookmark-icon-container">
				<p>
				<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
				</p>
			</div>
		</>
	);
};



const CompNoBookmarkFeed = ({ onNavigateAddBookmarkFeed }) => {
	return(
		<>
			<div className="nobookmark-icon-container">
				<p>
				<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
				</p>

				<p style={{ marginTop: 0, }}>
					<Button
						type="primary"
						onClick={() => onNavigateAddBookmarkFeed()}
					>
					Create bookmark list
					</Button>
				</p>
			</div>
		</>
	);
};


const DashboardBookmarkFeedBoardApp = () => {
  const [loading, setLoading] = useState(true);
	const scrollContainerRef = useRef(null);
	const [userbookmarks, setUserBookmarks] = useState([]); 
	const [userfollows, setUserFollows] = useState([]);	
	const { isauthenticated, user, usersettings } = useAuth();

	const [feeds, setFeeds] = useState([]);
	const [selectedFeed, setSelectedFeed] = useState(null);
	const [articles, setArticles] = useState([]);
	const [page, setPage] = useState(1); 
	const [hasMore, setHasMore] = useState(false);
	const [loadingArticles, setLoadingArticles] = useState(false);
	
	const navigate = useNavigate();
	
	const { pathname, search } = useLocation();
	const params = new URLSearchParams(search);


	useEffect(() => {
		if (params.get('scrollToTop') === 'true') {
			window.scrollTo(0, 0);
			params.delete('scrollToTop');
			navigate(`${pathname}?${params.toString()}`, { replace: true });
		}
	}, [pathname, search, navigate]);


	const handleSelectedFeed = async (feed) => {
		console.log(feed.id);
    setSelectedFeed(feed);
    setPage(1);
    setArticles([]);
    fetchArticles(feed.id, 1);
	};


	useEffect(() => {
		if (!isauthenticated) {
			setUserBookmarks([]);
			return;
		};

    const fetchUserBookmarks = async () => {
      try {
        const response = await axios.get(`/api/UserBookmarks/`);
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
			setUserFollows();
			return;
		};

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


	const toggleUserFollow = async (record) => {
		if (!isauthenticated) {
			return;
		};
		const isFollowed = userfollows.includes(record.source_id)

		setUserFollows(prev =>
			isFollowed 
				? prev.filter(id => id !== record.source_id)
				: [...prev, record.source_id]
		);

		try {
			const response = await axios.post(
				`/api/SourceUserFollowToggle/`,
				{ source: record.source_id },
				{ headers: { 'X-CSRFToken': csrftoken } }
			);

			if (response.data.message === 'Follow removed' && !isFollowed) {
				setUserFollows(prev => [...prev, record.source_id]);
			} else if (response.data.message !== "Follow removed" && isFollowed) {
				setUserFollows(prev => prev.filter(id => id !== record.source_id));
			}
		} catch (error) {
			console.error("Failed to follow source");
		}
	};


	const countClick = async (note) => {
		window.open(note.source_url, "_blank");
		try {
			const response = await Axios.post(`/api/UserClick/`,
				{ newsarticle: parseInt(note.id) },
				{ headers: { 'X-CSRFToken': csrftoken } }
			);
		} catch (error) {
      console.error("Failed to post click");
    }
	};


	const fetchArticles = async (feedId, pageNumber = 1) => {
		setLoadingArticles(true);

		try {
			const response = await axios.get(`/api/board-bookmark-feeds-single/?feed_id=${feedId}&page=${pageNumber}`);

			setArticles(prev =>
				pageNumber === 1
					? response.data.articles 
					: [...prev, ...response.data.articles]
			);
			setHasMore(response.data.has_more);
			setPage(pageNumber);
		} catch(error) {
			console.log(error);
		} finally {
			setLoadingArticles(false);
		}
	};


	useEffect(() => {
		const getFeeds = async () => {
			setLoading(true);
			setLoading(true)
			try {
				const response = await axios.get(`/api/board-bookmark-feeds/`);

				setFeeds(response.data);

				if (response.data.length) {
					handleSelectedFeed(response.data[0]);
				}
			} catch (error) {
				console.error('Failed to fetch feeds', error);
			} finally {
				setLoading(false);
			}
		};
		getFeeds();
	}, []);


	const loadMoreArticles = async () => {
		const nextPage = page + 1;

		try {
			const response = await axios.get(
				`/api/board-bookmark-feeds-single/?feed_id=${selectedFeed.id}&page=${nextPage}`
			);

			setArticles(prev => [
					...prev,
					...response.data.articles
				]);
			setPage(nextPage);
			setHasMore(response.data.has_more);
		} catch (error) {
			console.error("Failed loading more bookmark articles");
		}
	};



	const onNavigateAddBookmarkFeed = () => {
		navigate('/dashboard/bookmarks/addfeed/');
	};


	return (
		<>
			<Layout className="dashboard-feed-board-layout" style={{ height: "100%", flex: 1, minHeight: 0, }}>
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
					minHeight: 0 }}
				>
				
				<Col 
					span={4} 
					style={{ 
						height: '100%', display: 'flex', 
					}}
				>

				<div className="dashboard-feeds-container">
					{ feeds.length > 0 ? (
						feeds.map(feed => (
							<div 
								key={feed.id}
								onClick={() => handleSelectedFeed(feed)}
								className={`feed-item ${selectedFeed.id === feed.id ? "active" : ""}`}
								>
								<div className="dashboard-feed-board-title">
								{feed.title}
								</div>
								</div>
						))) : (
							<>
							<div className="dashboard-feed-board-title">
								No bookmark list yet
							</div>
							</>
						)
						}
				</div>

				 
				
				</Col>

				<Col 
					span={15}
					style={{
						height: '100%',
						display: 'flex',
					}}
				>
					<div className="article-panel"
						style={{ display: "flex", flexDirection: "column", minHeight: 0, width: "100%" }}
					>
					<Card className="scrollable-menu" style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
						{ feeds.length > 0 ? (
							articles.length > 0 ? (
								articles.map((article, i) => (
									<>
										<div className="dashboard-feed-board-article" key={i} style={{ marginBottom: '12px' }}>
											<div className="briefing-source-row" >

												<div className="dashboard-source-title-left">
												
													<div 
														onClick={() => navigate(`/dashboard/source/${encodeURIComponent(article.source_name)}?scrollToTop=true`)}
														className="home-source"
													>
													{article.source_name}
													</div>

													<div>
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
																marginRight: 5,
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
														</div>

														<div  
															className="dashboard-title"
															onClick={() => countClick(article)} 
														>
														<a href={article.source_url} target="_blank">
														<strong>{article.title}</strong>
														</a>
														</div>

														</div>

														<div className="dashboard-bookmark-stats-right">
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
																marginRight: 10,
																cursor: 'pointer',
																color: !isauthenticated
																	? "#868686"
																	: userbookmarks.includes(article.id)
																		? "#ffac00"
																		: "#868686",
															}}
														/>
														</Popover>

														<Popover
															placement="right"
															content={<ArticleStatsPopOverContent record={article} />} 
															trigger='click'
															color="rgba(26, 26, 26, 0.9)"
															>
															<StockOutlined
																className="antd-home-icon"
																style={{ marginLeft: 10, color: "#868686" }} 
															/>
														</Popover>
														</div>
													
													</div>
													
													<div style={{
														marginTop: 10,
														display: "flex",
														justifyContent: "space-between",
														alignItems: "center",
													}}>

													<div style={{
														display: "flex",
														alignItems: "center",
														flexWrap: "wrap",
													}}>

													{usersettings.show_article_timestamp && (
															<>
															<span className="dashboard-feed-board-date">
																{moment(article.date_posted).fromNow()}
															</span>
															</>
														)
													}

													{usersettings.show_article_tags && (
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

													</div> 
													
													</div>
												
											<Divider />	
											
										</div>
									</>
								))
							) : (
								<>
									<CompNoBookmarkedArticles />
								</>
							)) : (
								<>
									<CompNoBookmarkFeed 
									onNavigateAddBookmarkFeed={onNavigateAddBookmarkFeed}
									/>
								</>
							)}

									<div style={{ textAlign: "center", }}>
										{hasMore && (
											<Button
												loading={loadingArticles}
												onClick={loadMoreArticles}
											>
											Load More
											</Button>

											)}
									</div>
					</Card>

					</div>

				</Col>

				<Col span={1}>
					<>
						<div 
							onClick={() => navigate(`/dashboard/bookmarks/editfeed/${selectedFeed.id}`)}
						>
							<ToolOutlined
								style={{
									marginTop: 5,
									fontSize: 16,
									color: "#969696",
									cursor: 'pointer',
								}}
							/>
						</div>

						<div 
							onClick={() => navigate(`/dashboard/bookmarks/editfeed/${selectedFeed.id}/delete-feed`)}
						>
						<DeleteOutlined 
							style={{
								marginTop: 10,
								fontSize: 16,
								color: "#969696",
								cursor: 'pointer',
							}}
						/>
						</div>
					</>
				</Col>

				</Row>
				</Layout>	
				)}
				</Card>
			</Layout>
		</>
	);
};
export default DashboardBookmarkFeedBoardApp; 