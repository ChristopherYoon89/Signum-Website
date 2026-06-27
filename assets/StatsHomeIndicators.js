import React, {useState, useEffect, useRef} from 'react';
import { 
	Tag,
	Card,
	Layout,
	Row,
	Col,
	Tooltip,
	Divider,
	Popover,
 } from 'antd';
import Axios from "axios";
import { Link } from "react-router-dom";
import {
		RightOutlined,
		LeftOutlined,
		StarOutlined,
		StockOutlined,
	} from '@ant-design/icons';
import moment from 'moment';
import { getCookie } from './ManagerUtility';


var csrftoken = getCookie('csrftoken');


const PopArticles = ({ 
		poparticlesdata,
		isauthenticated, 
		userfollows, 
		countClick, 
		userbookmarks, 
		toggleUserFollow,
		setUserBookmarks,
		DashboardBookmarkFeedPopover,
		ArticleStatsPopOverContent,
	}) => {

	return(
		<>
		<h2 className='home-indicator-header'>Most Read</h2>
		<Card
				bordered={false}
				className={'scrollable-indicator-card'}
				>
				<div style={{ marginTop: -15, }}>
					{
						poparticlesdata.map((article, index) => (
							<div style={{ marginTop: 15, }}>
								<span
							
							className="home-source"
						>

						</span>
						
						<Link to={`/dashboard/source/${encodeURIComponent(article.source_name)}?scrollToTop=true`}>
						<span 
							className="home-indicators-article-sourcename"
						>
						{article.source_name}
						</span>
						</Link>
						<span style={{ marginLeft: 5, marginRight: 5 }}>
						|
						</span> 
						<span 
							className="home-indicators-article-title"
							onClick={() => countClick(article)}
						> 
						{article.title}
						</span> 
					
						<p style={{ marginTop: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>

							
							<span className="ant-home-date">
							{moment(article.date_posted).fromNow()}
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
							
						<Divider style={{ borderColor: "#5c5c5c", marginTop: 0, }}/>
						</div>
							
						))
					}
			</div>
		</Card>
		</>
	);
};

	
const StatsHomeTags = ({ tagstabledata }) => {
	
	const colors = [
		"#5e5e5e", 
	];

	return (
		<>
			<h2 className='home-indicator-header'>Top Keywords</h2>
			<Card
				bordered={false}
				className={'scrollable-indicator-card'}
				>
					<div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
					{tagstabledata.map((tag, index) => (
						<Link to={`/dashboard/tag/${encodeURIComponent(tag)}?scrollToTop=true`}>
						
						<Tag key={index} className="table-tag" color={colors[index % colors.length]}>
							{tag}
						</Tag>
						
						</Link>
					))}
				</div>		
			</Card>
		</>
	);
};


const StatsHomeIndicators = ({
			isauthenticated, 
			userfollows, 
			countClick, 
			userbookmarks, 
			toggleUserFollow,
			setUserBookmarks,
			DashboardBookmarkFeedPopover,
			ArticleStatsPopOverContent,
	}) => {
	
	const [tagstabledata, setTagsData] = useState([]);
	const [poparticlesdata, setPopArticlesData] = useState([]);
	const scrollContainerRef = useRef(null);


	useEffect(() => {
			const getOverallData = async () => {
				try {
					const response = await Axios.get(`/api/home-stats-tags/`);
					setTagsData(response.data.tags);
					setPopArticlesData(response.data.popular_articles);
				} catch (error) {
					console.error("Failed to fetch data");
				}
			};
			getOverallData();
		}, []);


	return (
		<>
			<Layout className={"bg-dark"}>
				<Row gutter={[15, 15]}>
					<div className='home-indicator-scroll-container' ref={scrollContainerRef}>
						<Col xs={24} sm={12} md={12}>
							<PopArticles 
								poparticlesdata={poparticlesdata}
								isauthenticated={isauthenticated}
								userfollows={userfollows}
								countClick={countClick} 
								userbookmarks={userbookmarks}
								toggleUserFollow={toggleUserFollow}
								setUserBookmarks={setUserBookmarks}
								DashboardBookmarkFeedPopover={DashboardBookmarkFeedPopover}
								ArticleStatsPopOverContent={ArticleStatsPopOverContent}
							/>
						</Col>
						<Col xs={24} sm={12} md={12}>
							<StatsHomeTags 
								tagstabledata={tagstabledata}
							/>
						</Col>
					</div>
				</Row>
			</Layout>
		</>
	);
};
export default StatsHomeIndicators; 