import React, {useState, useEffect, useRef} from 'react';
import { 
	Tag,
	Card,
	Divider,
	Layout,
	Row,
	Col,
 } from 'antd';
import Axios from "axios";
import { useNavigate } from "react-router-dom";
import {
		RightOutlined,
		LeftOutlined,
	} from '@ant-design/icons';


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


const StatsHomeIndicators = () => {
	const [overalltabledata, setOverallData] = useState({});
	const [tagstabledata, setTagsData] = useState([]);
	const [poparticlesdata, setPopArticlesData] = useState([]);
	const scrollContainerRef = useRef(null);
	const navigate = useNavigate();


	useEffect(() => {
			const getOverallData = async () => {
				try {
					const response = await Axios.get(`/api/home-stats-tags/`);
					setOverallData(response.data.indicators);
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


	const OverallIndicatorsArchive = () => {
		return(
			<>
			<h2 className='home-indicator-header'>Signum Indicators</h2>
				<Card
					bordered={false}
					className='scrollable-indicator-card'
					>
					<div style={{textAlign: 'center' }}>
						<p>Total number of articles in the archive: <Tag color={"geekblue"}>{overalltabledata.total_articles}</Tag></p>
						<p>New articles (last 24h): <Tag color={"green"}>{overalltabledata.articles_last_24h}</Tag></p>			
						<p>Total number of published sources: <Tag color={"red"}>{overalltabledata.published_sources}</Tag></p>
						<p>Average user rating: <Tag color={"yellow"}>{overalltabledata.avg_user_rating}</Tag></p>
						<p>Average algorithm rating: <Tag color={"purple"}>{overalltabledata.avg_algo_rating}</Tag></p>
						<p>Total number of active users: <Tag color={"geekblue"}>{overalltabledata.total_users}</Tag></p>
					</div>
				</Card>
			</>
		);
	};


	const colors = [
		"blue", "geekblue", "purple",
		"cyan", "green", "magenta",
		"volcano", "orange"
	];

	
	const StatsHomeTags = () => {
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


	const PopArticles = () => {
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
							></span>
									<span 
										className="home-indicators-article-sourcename"
										onClick={() => navigate(`/dashboard/source/${encodeURIComponent(article.source_name)}?scrollToTop=true`)}
										>{article.source_name}</span>
									<span className="home-indicators-article-title"> | <a href={article.source_url} target="_blank" rel="noopener noreferrer">{article.title}</a></span> 
								</div>
							))
						}
				</div>
			</Card>
			</>
		);
	};

	return (
		<>
			<Layout className={"bg-dark"}>
				<Row gutter={[15, 15]}>
					<LeftOutlined
						onClick={scrollLeft}
						style={{
							position: 'absolute',
							left: 0,
							top: '50%',
							zIndex: 10,
							transform: 'translateY(-50%)',
							fontSize: 14,
							cursor: 'pointer',
							background: '#1a1a1a',
							borderRadius: '50%',
							border: '1px solid #154360',
							padding: '8px',
							boxShadow: '0 0 6px rgba(0,0,0,0.2)'
						}}
					/>
					<div className='home-indicator-scroll-container' ref={scrollContainerRef}>
						<Col xs={24} sm={12} md={12}>
							<PopArticles />
						</Col>
						<Col xs={24} sm={12} md={12}>
							<StatsHomeTags />
						</Col>
						<Col xs={24} sm={12} md={12}>
							<OverallIndicatorsArchive />
						</Col>
					</div>
					<RightOutlined
						onClick={scrollRight}
						style={{
							position: 'absolute',
							right: 0,
							top: '50%',
							zIndex: 10,
							transform: 'translateY(-50%)',
							fontSize: 14,
							cursor: 'pointer',
							background: '#1a1a1a',
							borderRadius: '50%',
							border: '1px solid #154360',
							padding: '8px',
							boxShadow: '0 0 6px rgba(0,0,0,0.2)'
						}}
					/>
				</Row>
			</Layout>
		</>
	);
};
export default StatsHomeIndicators; 