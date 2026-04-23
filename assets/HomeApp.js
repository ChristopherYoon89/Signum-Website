import React, { useState, useEffect, useRef } from 'react';
import {
	Row,
	Col,
	Card,
	Layout,
	Divider,
	Popover,
	Tag,
	Tooltip,
  } from 'antd';
import {
	StarOutlined,
	StockOutlined,
	PlusOutlined,
} from '@ant-design/icons';
import Axios from "axios";
import axios from 'axios';
import ArticleStatsPopOverContent from './StatsNewsArticle.js';
import SidebarApp from './SidebarApp.js';
import HomeBanner from './HomeBanner.js';
import { useNavigate, useLocation } from "react-router-dom";
import moment from 'moment';
import StatsHomeIndicators from './StatsHomeIndicators.js';
import HomeCategories from './HomeCategories.js';
import DashboardBookmarkFeedPopover from './DashboardBookmarkFeedPopover.js';
import { useAuth } from "./AuthProvider.js";


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


const CategoryArticles = ({ 
												articles, 
												navigate, 
												isauthenticated, 
												userfollows, 
												createClick, 
												userbookmarks, 
												toggleUserFollow,
												setUserBookmarks,
											}) => {
	return (
		<div className={"home-article-container"}>
			{articles.map((article) => (
				<Card 
					key={article.id}
					className={"bg-transparent"}
					bordered={false}
					bodyStyle={{ padding: 0, marginTop: 0 }}
					>
					<p>	
						<span
							onClick={() => navigate(`/dashboard/source/${encodeURIComponent(article.source_name)}?scrollToTop=true`)}
							className="home-source"
						>
							{article.source_name}
						</span>
						<span className="home-source-plus-icon">
							<Tooltip
								title={
									!isauthenticated
										? "Log in to follow"
										: userfollows.includes(article.source_id)
											? "Unfollow"
											: "Follow"
								}
							>
							<PlusOutlined
								style={{
									marginLeft: 5,
									fontSize: "0.85em",
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
						<span className="ant-home-date">
							{moment(article.date_posted).fromNow()}
						</span>
					</p>

					<h5 className={"home-article-title"}>
						<a href={article.source_url} target="_blank" rel="noopener noreferrer">
							<span onClick={() => createClick(article)}>
								{article.title}
							</span>
						</a>
					</h5>					

					<p style={{ marginTop: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
						<span className="home-article-tags">
						Tags: 
						<span
							onClick={(e) => {
								navigate(`/dashboard/tag/${encodeURIComponent(article.tag1)}?scrollToTop=true`);
								}}  
							style={{ marginRight: 5, marginLeft: 5, }}
						>
						<Tag className="table-tag" color={"purple"}>{article.tag1}</Tag>
						</span>
						<span 
							onClick={(e) => {
								navigate(`/dashboard/tag/${encodeURIComponent(article.tag2)}?scrollToTop=true`);
								}}
							style={{ marginRight: 5, }}
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
					</span>
						<span>
							<Tooltip
								title={
									!isauthenticated
										? "Log in to add bookmark"
										: userbookmarks.includes(article.id) 
										? "Remove bookmark" 
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
								<StockOutlined className="antd-home-icon" style={{ marginLeft: 25 }} />
								</Tooltip>
							</Popover>
						</span>
					</p>
					<Divider style={{ borderColor: "#e0e7e7" }}/>
				</Card>
			))}
		</div>
	);
};


const HomeApp = () => {
	const [userbookmarks, setUserBookmarks] = useState([]); 
	const [userfollows, setUserFollows] = useState([]);
	const [groupedArticles, setGroupedArticles] = useState({});
	const [loading, setLoading] = useState(true);
	const topSectionRef = useRef(null);
	const { isauthenticated, user } = useAuth();

	const navigate = useNavigate();

	const { location, pathname, search } = useLocation();
	const params = new URLSearchParams(search);


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


	useEffect(() => {
		const fetchArticles = async () => {
			try {
				const response = await axios.get('/api/grouped-articles/?limit=5');
				setGroupedArticles(response.data);
				setLoading(false);
			} catch (error) {
				console.error("Failed to fetch articles");
			}
		};
		fetchArticles();
	}, []);


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
			if (params.get('scrollToTop') === 'true') {
				window.scrollTo(0, 0);
				params.delete('scrollToTop');
				navigate(`${pathname}?${params.toString()}`, { replace: true });
			}
		}, [pathname, search, navigate]);


	return(
		<>
			<Layout className={"bg-dark"}>
				<HomeBanner />
						{!isauthenticated && (
						<div style={{ textAlign: "center", }}>
							<button 
								className="home-register-button" 
								onClick={() => {
									window.location.href = window.DJANGO_URLS.register;
								}}
							>
							Register for free
							</button>
						</div>
						)}
				<Row gutter={20}>

				<Col span={6}>
				
				</Col>
				
				<Col className="gutter-row" span={12} style={{ padding: 5, }}>
					<StatsHomeIndicators />
				</Col>
			</Row>			

				<div ref={topSectionRef} className="toggle-button-container">
					<HomeCategories />
				</div>
			
				<Row gutter={20} style={{ marginTop: 55,}}>

					<Col 
						className="gutter-row" 
						span={6}>
					
					</Col>
				
					<Col 
						className="gutter-row" 
						style={{ 
							backgroundColor: '#fff',
							paddingLeft: 150,
							paddingRight: 185,
							paddingBottom: 55,
							paddingTop: 55,
						 }} 
						span={12}
						>

					<h1 style={{ color: "#000", marginBottom: 35, }}>POLITICS</h1>

					{loading ? (
					<p>Loading articles...</p>
					) : (
					<>
						{["Worldwide", "USA", "Europe", "Middle East", "Asia", "Latin America", "Africa"].map((category) => (
							<div className='home-category-scroll-section' key={category} id={category}>
								<div className="category-header-container">
									<h4 className="home-category-header">{category}</h4>
									<Tooltip
										title={"Back to categories"}
									>	
									<button className="btn-home-back-to-top" 
										onClick={() => {
											topSectionRef.current?.scrollIntoView({
												behavior: "smooth",
												block: "start",
											});
											navigate(location.pathname, { replace: true });
										}}
									>
									⬆ 
									</button>
									</Tooltip>
								</div>
								
								<Divider style={{ borderColor: "#e0e7e7" }} />
								<CategoryArticles 
									articles={groupedArticles[category] || []}
									navigate={navigate}
									isauthenticated={isauthenticated}
									userfollows={userfollows}
									createClick={createClick}
									userbookmarks={userbookmarks}
									toggleUserFollow={toggleUserFollow} 
									setUserBookmarks={setUserBookmarks}
								/>
								<span 
									className="home-read-more"
									onClick={() => navigate(`/dashboard/category/${category}?scrollToTop=true`)}
									>
									read more
								</span>
							</div>
						))}
					</>
					)}

					</Col>

				</Row>


				<Row gutter={20} style={{ marginTop: 85, }}>

					<Col className="gutter-row" span={6}>
					
					</Col>

					<Col 
						className="gutter-row" 
						style={{ 
							backgroundColor: '#fff',
							paddingLeft: 150,
							paddingRight: 185,
							paddingBottom: 55,
							paddingTop: 55,
						 }} 
						span={12}>
					
					<h1 style={{ color: "#000", marginBottom: 35, }}>ECONOMICS</h1>

					{loading ? (
					<p>Loading articles...</p>
					) : (
					<>
						{["Money & Finance", "Companies", "Commodities", "Bitcoin"].map((category) => (
							<div className='home-category-scroll-section' key={category} id={category}>
								<div className="category-header-container">
								<h4 className="home-category-header">{category}</h4>
								<Tooltip
									title={"Back to categories"}
									>	
									<button className="btn-home-back-to-top" 
										onClick={() => {
											topSectionRef.current?.scrollIntoView({
												behavior: "smooth",
												block: "start",
											});

											navigate(location.pathname, { replace: true });
										}}
										>
										⬆ 
									</button>
								</Tooltip>
								</div>
								<Divider style={{ borderColor: "#e0e7e7" }} />
								<CategoryArticles 
									articles={groupedArticles[category] || []}
									navigate={navigate}
									isauthenticated={isauthenticated}
									userfollows={userfollows}
									createClick={createClick}
									userbookmarks={userbookmarks}
									toggleUserFollow={toggleUserFollow} 
									setUserBookmarks={setUserBookmarks}
								/>
								<span 
									className="home-read-more"
									onClick={() => navigate(`/dashboard/category/${category}?scrollToTop=true`)}
									>read more
								</span>
							</div>
						))}
					</>
					)}
					</Col>
					
				</Row>


				<Row gutter={20} style={{ marginTop: 85, }}>
				<Col className="gutter-row" span={6}>

				</Col>
					
				<Col 
					className="gutter-row" 
					style={{ 
						backgroundColor: '#fff',
							paddingLeft: 150,
							paddingRight: 185,
							paddingBottom: 55,
							paddingTop: 55,
					}}
					span={12}
					>										
					<h1 style={{ color: "#000", marginBottom: 35, }}>SOCIETY</h1>

					{loading ? (
					<p>Loading articles...</p>
					) : (
					<>
						{["Tech", "Science", "Culture", "Panorama"].map((category) => (
							<div className='home-category-scroll-section' key={category} id={category}>
								<div className="category-header-container">
								<h4 className="home-category-header">{category}</h4>
								<Tooltip
									title={"Back to categories"}
									> 	
								<button className="btn-home-back-to-top" 
									onClick={() => {
										topSectionRef.current?.scrollIntoView({
											behavior: "smooth",
											block: "start",
										});

										navigate(location.pathname, { replace: true });
									}}
									>
									⬆ 
								</button>
								</Tooltip>
								</div>
								<Divider style={{ borderColor: "#e0e7e7" }} />
								<CategoryArticles 
									articles={groupedArticles[category] || []}
									navigate={navigate}
									isauthenticated={isauthenticated}
									userfollows={userfollows}
									createClick={createClick}									
									userbookmarks={userbookmarks} 
									toggleUserFollow={toggleUserFollow}
									setUserBookmarks={setUserBookmarks}
								/>
								<span 
									className="home-read-more"
									onClick={() => navigate(`/dashboard/category/${category}?scrollToTop=true`)}
									>
									read more
								</span>
							</div>
						))}
					</>
					)}

					</Col>

				</Row>
				
				<SidebarApp />
				
			</Layout>
		</>
	)
}
export default HomeApp;