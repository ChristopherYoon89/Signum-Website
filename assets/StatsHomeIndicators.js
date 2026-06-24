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
import { useNavigate } from "react-router-dom";
import {
		RightOutlined,
		LeftOutlined,
		StarOutlined,
		StockOutlined,
	} from '@ant-design/icons';
import moment from 'moment';


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


const PopArticles = ({ 
		poparticlesdata,
		isauthenticated, 
		userfollows, 
		createClick, 
		userbookmarks, 
		toggleUserFollow,
		setUserBookmarks,
		DashboardBookmarkFeedPopover,
		ArticleStatsPopOverContent,
		navigate
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
						<span 
							className="home-indicators-article-sourcename"
							onClick={() => navigate(`/dashboard/source/${encodeURIComponent(article.source_name)}?scrollToTop=true`)}
						>
						{article.source_name}
						</span>
						<span className="home-indicators-article-title"> | <a href={article.source_url} target="_blank" rel="noopener noreferrer">{article.title}</a></span> 
					
						<p style={{ marginTop: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>

							<span className="home-article-tags">
								<span className="ant-home-date">
								{moment(article.date_posted).fromNow()}
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
									color="rgb(24, 24, 24)"
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

	
const StatsHomeTags = ({ tagstabledata, navigate }) => {
	
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
						<span
							onClick={(e) => {
								e.stopPropagation(); 
								navigate(`/dashboard/tag/${encodeURIComponent(tag)}?scrollToTop=true`);
								}}
						>
						<Tag key={index} className="table-tag" color={colors[index % colors.length]}>
							{tag}
						</Tag>
						</span>
					))}
				</div>		
			</Card>
		</>
	);
};


const StatsHomeIndicators = ({
			isauthenticated, 
			userfollows, 
			createClick, 
			userbookmarks, 
			toggleUserFollow,
			setUserBookmarks,
			DashboardBookmarkFeedPopover,
			ArticleStatsPopOverContent,
	}) => {
	
	const [tagstabledata, setTagsData] = useState([]);
	const [poparticlesdata, setPopArticlesData] = useState([]);
	const scrollContainerRef = useRef(null);
	const navigate = useNavigate();


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
			<Layout className={"bg-dark"}>
				<Row gutter={[15, 15]}>
					<div className='home-indicator-scroll-container' ref={scrollContainerRef}>
						<Col xs={24} sm={12} md={12}>
							<PopArticles 
								poparticlesdata={poparticlesdata}
								isauthenticated={isauthenticated}
								userfollows={userfollows}
								createClick={createClick} 
								userbookmarks={userbookmarks}
								toggleUserFollow={toggleUserFollow}
								setUserBookmarks={setUserBookmarks}
								DashboardBookmarkFeedPopover={DashboardBookmarkFeedPopover}
								ArticleStatsPopOverContent={ArticleStatsPopOverContent}
								navigate={navigate}
							/>
						</Col>
						<Col xs={24} sm={12} md={12}>
							<StatsHomeTags 
								tagstabledata={tagstabledata}
								navigate={navigate}
							/>
						</Col>
					</div>
				</Row>
			</Layout>
		</>
	);
};
export default StatsHomeIndicators; 