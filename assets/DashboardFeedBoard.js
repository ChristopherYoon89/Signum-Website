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
	Empty,
  } from 'antd';
import {
	SyncOutlined,
	PlusOutlined,
	StarOutlined,
	StockOutlined,
	ToolOutlined,
	DeleteOutlined,
	ControlOutlined,
} from '@ant-design/icons';
import axios from 'axios';
import { Link } from "react-router-dom";
import { useAuth } from "./AuthProvider.js";
import ArticleStatsPopOverContent from './StatsNewsArticle.js';
import moment from 'moment';
import DashboardBookmarkFeedPopover from './DashboardBookmarkFeedPopover.js';
import { useBookmarks, useSourceFollow } from './ManagerHooks.js';
import { countClick, getCookie } from './ManagerUtility.js';


var csrftoken = getCookie('csrftoken');


const CompNoArticles = () => {
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


const DashboardFeedBoardApp = () => {
	const [loading, setLoading] = useState(true);
	const scrollContainerRef = useRef(null);
	const { isauthenticated, user, usersettings } = useAuth();

	const [feeds, setFeeds] = useState([]);
	const [selectedFeed, setSelectedFeed] = useState(null);
	const [articles, setArticles] = useState([]);
	const [page, setPage] = useState(1);
	const [hasMore, setHasMore] = useState(false);
	const [loadingArticles, setLoadingArticles] = useState(false);

	const {
		userbookmarks,
		setUserBookmarks
	} = useBookmarks();


	const {
		userfollows,
		toggleUserFollow
	} = useSourceFollow();


	const handleSelectedFeed = async (feed) => {
    setSelectedFeed(feed);
    setPage(1);
    setArticles([]);
    fetchArticles(feed.id, 1);
	};


	const fetchArticles = async (feedId, pageNumber = 1) => {
    setLoadingArticles(true);

    try {
        const res = await axios.get(
            `/api/board-feeds-single/?feed_id=${feedId}&page=${pageNumber}`
        );

        setArticles(prev =>
            pageNumber === 1
                ? res.data.articles
                : [...prev, ...res.data.articles]
        );

        setHasMore(res.data.has_more);
        setPage(pageNumber);
    } catch(error){
        console.log(error);
    }	finally {
        setLoadingArticles(false);
    } 
	};


	useEffect(() => {
		const getFeeds = async () => {
			setLoading(true);
			try {
				const response = await axios.get(`/api/board-feeds/`);

				setFeeds(response.data);
				if (response.data.length) {
						handleSelectedFeed(response.data[0]);
						
				}
			} catch (error) {
				console.error("Failed to fetch feeds");
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
							`/api/board-feeds-single/?feed_id=${selectedFeed.id}&page=${nextPage}`
					);
					setArticles(prev => [
							...prev,
							...response.data.articles
					]);
					setPage(nextPage);
					setHasMore(response.data.has_more);
			}
			catch(err){
					console.log(err);
			}
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
					minHeight: 0
				}}>

				<Col span={4}
					style={{
							height: '100%',
							display: 'flex'
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
								No feed displayed
								</div>
							</>
						)}
					</div>
				
				</Col>
						
				<Col span={15}
					style={{
							height: '100%',
							display: 'flex'
					}}>
						<div className="article-panel"
							style={{ display: "flex", flexDirection: "column", minHeight: 0, width: "100%", }}
						>
							<Card className="scrollable-menu" style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
								
								{articles.length > 0 ? (
									articles.map((article, i) => (
										<>
										<div className="dashboard-feed-board-article" key={i} style={{ marginBottom: '12px' }}>
											<div className="briefing-source-row">

												<div className="dashboard-source-title-left">

													<Link to={`/dashboard/source/${encodeURIComponent(article.source_name)}?scrollToTop=true`}>				
													<div className="dashboard-source">
													{article.source_name}
													</div>
													</Link>

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
														{article.title}
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
												{ usersettings.show_article_timestamp && (
														<>
														<span className="dashboard-feed-board-date">
															{moment(article.date_posted).fromNow()}
														</span>
														</>
													)}

													{usersettings.show_article_tags && (
														<>
														<Link to={`/dashboard/tag/${encodeURIComponent(article.tag1)}?scrollToTop=true`}>	
														<Tag className="table-tag" color={"purple"}>{article.tag1}</Tag>													
														</Link>

														<Link to={`/dashboard/tag/${encodeURIComponent(article.tag2)}?scrollToTop=true`}>
														<Tag className="table-tag" color={"green"}>{article.tag2}</Tag>
														</Link>

														<Link to={`/dashboard/tag/${encodeURIComponent(article.tag3)}?scrollToTop=true`}>
														<Tag className="table-tag" color={"blue"}>{article.tag3}</Tag>
														</Link>
														</>
													)
												}

												</div>
													
												</div>
												
											<Divider />	

										</div>
									</>
										
									)
									)
									) : (
										<>
										<CompNoArticles />
										</>
									)}
									{hasMore && (
										<div style={{ textAlign: "center" }}>
												<Button
														loading={loadingArticles}
														onClick={loadMoreArticles}
												>
												Load More
												</Button>
										</div>
									)}
									</Card>
						</div>
				</Col>

				<Col span={1}>
				{ feeds.length > 0 && (
					
					selectedFeed.feed_type === "personal_feed" ? (
					<>
						<div>
						<Link to={`/dashboard/briefing/editfeed/${selectedFeed.id}`}>
							<ToolOutlined
								style={{
									marginTop: 5,
									fontSize: 16,
									color: "#969696",
									cursor: 'pointer',
								}}
							/>
							
						</Link>
						</div>
						
						<div>
						<Link to={`/dashboard/briefing/editfeed/${selectedFeed.id}/delete-feed`}>
							<DeleteOutlined 
								style={{
									marginTop: 12,
									fontSize: 16,
									color: "#969696",
									cursor: 'pointer',
								}}
							/>
						</Link>
						</div>
					</>
				) : (
						<Link to={`/dashboard/settings`}>
							<ToolOutlined
								style={{
									marginTop: 5,
									fontSize: 16,
									color: "#969696",
									cursor: 'pointer',
								}}
							/>
						</Link>
				))
				}
				</Col>

				</Row>
				</Layout>	
				)}
				</Card>
			</Layout>
		</>
	)
}
export default DashboardFeedBoardApp;


