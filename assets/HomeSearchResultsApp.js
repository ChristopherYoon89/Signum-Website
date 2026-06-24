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
	Button,
  } from 'antd';
import {
	StarOutlined,
	StockOutlined,
	PlusOutlined,
	SyncOutlined,
} from '@ant-design/icons';
import Axios from "axios";
import axios from 'axios';
import ArticleStatsPopOverContent from './StatsNewsArticle.js';
import SidebarApp from './SidebarApp.js';
import HomeBanner from './HomeBanner.js';
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import moment from 'moment';
import StatsHomeIndicators from './StatsHomeIndicators.js';
import HomeCategories from './HomeCategories.js';
import DashboardBookmarkFeedPopover from './DashboardBookmarkFeedPopover.js';
import { useAuth } from "./AuthProvider.js";
import HomeSearchApp from './HomeSearchApp.js';


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


function ScrollReveal({ children }) {
	const ref = useRef(null);
	const [isVisible, setIsVisible] = useState(false);

	useEffect(() => {
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					setIsVisible(true);
				}
			},
			{
				threshold: 0.02, // starts when 2% visible
			}
		);

		if (ref.current) {
			observer.observe(ref.current);
		}

		return () => observer.disconnect();
	}, []);

	return (
		<div
			ref={ref}
			className={`scroll-reveal ${
				isVisible ? "visible" : ""
			}`}
		>
			{children}
		</div>
	);
};



const CategoryArticles = ({ 
		article, 
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
						
						<a href={article.source_url} target="_blank" rel="noopener noreferrer">
							<span className={"home-article-title"} onClick={() => createClick(article)}>
								{article.title} 
							</span>
						</a>
						
					</p>			

					<p style={{ marginTop: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>

						<span className="home-article-tags">
						 <span className="ant-home-date">
							{moment(article.date_posted).fromNow()}
						</span>
						<span
							onClick={(e) => {
								navigate(`/dashboard/tag/${encodeURIComponent(article.tag1)}?scrollToTop=true`);
								}}  
							style={{ marginRight: 5}}
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
							
							<Popover
								placement="right"
								content={<ArticleStatsPopOverContent record={article} />} 
								trigger='click'
								color="rgba(26, 26, 26, 0.9)"
								>
							
								<StockOutlined className="antd-home-icon" style={{ marginLeft: 25 }} />
							
							</Popover>
						</span>
					</p>
					<Divider style={{ borderColor: "#e0e7e7" }}/>
				</Card>
		</div>
	);
};


const HomeSearchResultsApp = () => {
	const [userbookmarks, setUserBookmarks] = useState([]); 
	const [userfollows, setUserFollows] = useState([]);
	const [tabledata, setstate] = useState([]);
	const [loading, setLoading] = useState(true);
	const { isauthenticated, user } = useAuth();
	const [searchParams] = useSearchParams();
	const [showadvancedfilters, setShowAdvancedFilters] = useState(false);

	const [page, setPage] = useState(1);
	const [hasMore, setHasMore] = useState(true);
	const [loadingMore, setLoadingMore] = useState(false);

	const navigate = useNavigate();

	const { location, pathname, search } = useLocation();
	const params = new URLSearchParams(search);


	useEffect(() => {
		setPage(1);
		setHasMore(true);
		setstate([]);
		getData(1);
  }, [searchParams]);


  const getData = async (pageNumber = 1) => {
		
		if (pageNumber === 1) {
			setLoading(true);
		} else {
			setLoadingMore(true);
		}

		const paramsObject = Object.fromEntries(searchParams.entries());
		try {
			const response = await axios.get(`/api/search-results`, 
				{ params: {
					...paramsObject,
					page: pageNumber					
				}
				});
			
			const newData = response.data.results.map(row => ({
					id: row.id,
					source: row.source,
					source_id: row.source_id,
					source_name: row.source_name,
					source_url: row.source_url,
					title: row.title,
					date_posted: row.date_posted,
					language: row.language,
					category_primary: row.category_primary,
					category_primary_name: row.category_primary_name,
					category_primary_id: row.category_primary_id,
					tag1: row.tag1,
					tag2: row.tag2,
					tag3: row.tag3,
					algo_rating: parseFloat(row.algo_rating),
					average_rating: parseFloat(row.average_rating),
					clicks_count: parseFloat(row.clicks_count), 
					average_sourcerating: parseFloat(row.average_sourcerating),
					average_algo_sourcerating: parseFloat(row.average_algo_sourcerating),
				}));
				if (pageNumber === 1) {
						setstate(newData);
					} else {
						setstate(prev => [...prev, ...newData]);
					}
					setHasMore(response.data.next !== null);
					setPage(pageNumber);				
		} catch (error) {
			console.error("Failed to fetch article data");
		} finally {
			setLoading(false);
			setLoadingMore(false);
		};
	};


	const showAdvancedFilters = () => {
		setShowAdvancedFilters(!showadvancedfilters);
	};


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

	return (
		<>
			<Layout className={"bg-dark"}>
				<HomeBanner />
				
				<Row gutter={20} style={{ marginBottom: 15,}}>
				
				<Col span={6}>
				
				</Col>
				
				<Col className="gutter-row" span={12} style={{ padding: 0, }}>

					<HomeSearchApp />

				</Col>
				</Row >

				{showadvancedfilters && (
					<>
						<AdvancedFilters />	
					</>
				)
				}
						
				<Row gutter={20} style={{ marginTop: 0, backgroundColor: "#fff"}}>

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
						 }} 
						span={12}
						>

					{loading ? (
					<div style={{
						marginTop: 25, 
						display: "flex",
						justifyContent: "center",
						alignItems: "center",
						minHeight: 160,
						height: "100%",
						width: "100%",
						textAlign: "center",
						}}
					>
					<SyncOutlined spin style={{color: "#5e5e5e", fontSize: 24,}}/>
					</div>
					) : (
					<>
						<div style={{marginTop: 25, }}>
						<h3>Results</h3>

						<Divider
								style={{
										borderColor: "#e0e7e7",
										marginTop: 10,
								}}
						/>

						<ScrollReveal>
								{tabledata.length === 0 ? (
										<>
										<div className="search-results-noarticles">
										No articles found
										</div>
										</>
								) : (
										tabledata.map((article) => (
												<div
														key={article.id}
														className="home-category-scroll-section"
												>
														<CategoryArticles
																article={article}
																navigate={navigate}
																isauthenticated={isauthenticated}
																userfollows={userfollows}
																createClick={createClick}
																userbookmarks={userbookmarks}
																toggleUserFollow={toggleUserFollow}
																setUserBookmarks={setUserBookmarks}
														/>
												</div>
										))
								)}
						</ScrollReveal>

						{!loading && hasMore && (
								<div
									style={{
											textAlign: "center",
											marginTop: 16,
											flexShrink: 0,
											height: 70,
									}}
								>
								<Button
									loading={loadingMore}
									onClick={() => getData(page + 1)}
								>
								{loadingMore ? "Loading..." : "Load more"}
								</Button>
								</div>
						)}
				</div>
		</>
					
					)}

					</Col>
				</Row>
				<SidebarApp />
			</Layout>
		</>
	)
}
export default HomeSearchResultsApp;