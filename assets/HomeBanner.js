import React, { useState, useEffect } from 'react';
import {
	Row,
	Col,
	Card,
  } from 'antd';
import {
	ApiOutlined,
	ApartmentOutlined,
	WifiOutlined,
	AppstoreAddOutlined,
} from '@ant-design/icons';
import { useNavigate } from "react-router-dom";


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



const HomeBanner = () => {
	const navigate = useNavigate();

	
	const navigateProductPage = () => {
		window.location.href = window.DJANGO_URLS.product;
	};


	const navigateDonatePage = () => {
		window.location.href = window.DJANGO_URLS.donate;
	};


	const navigateAPIPage = () => {
		window.location.href = window.DJANGO_URLS.apipage;
	};
	

	return(
		<>
			<Row gutter={[24, 32]} style={{ marginLeft: 15, }}>
				<Col span={1}>
				
				</Col>
				<Col span={4}>
					<Card 
						className="banner-container"
						onClick={() => navigateProductPage()}
						>
					<WifiOutlined style={{ fontSize: "26pt", marginBottom: 10, marginTop: 5, color: "#215f14" }}/>
					<p className='banner-header'>High-Signal Content</p>

					<p class="banner-text">
					Worldwide aggregated and curated news articles, analysis and other 
					content from thousands of sources about current events and general topics.
					</p>
					</Card>
				</Col>
				<Col span={4} >
				<Card 
						onClick={() => navigateProductPage()}
						className="banner-container">
					<AppstoreAddOutlined style={{ fontSize: "26pt", marginBottom: 10, marginTop: 5, color: "#ffbb00" }}/>
					<p className='banner-header'>Personal Feeds</p>

					<p class="banner-text">
					Create your own news feeds by customizing your algorithm and filtering categories,
					sources and keywords.
				</p>
					</Card>
				</Col>
				<Col span={4} >
				<Card
						onClick={() => navigateProductPage()} 
						className="banner-container">
					<ApartmentOutlined style={{ fontSize: "26pt", marginBottom: 10, marginTop: 5, color: "#781c8f" }} />
					<p className='banner-header'>News Analysis</p>

					<p class="banner-text">
					Access your personal dashboard to manage news and analyze trends, 
					relevant topics, keywords and user signals.
					</p>
					</Card>
				</Col>
				
				<Col span={4} >
				<Card
					onClick={() => navigateAPIPage()} 
					className="banner-container"
				>	
				<ApiOutlined style={{ fontSize: "26pt", marginBottom: 10, marginTop: 5, color: "#41d3d8" }}/>
				
				<p className='banner-header'>Public API</p>

				<p class="banner-text">
				Get real-time access to our API and integrate large amounts of news data into your 
				own systems and software.  
				</p>
				</Card>
				</Col>
				<Col span={4}>
				<Card
					onClick={() => navigateDonatePage()} 
					className="banner-container">
				<img className="banner-icon-donate" src="/static/main_app/media/bitcoin.webp" />
				<p className='banner-header'>Donate!</p>

				<p class="banner-text">
				We benefit from free and open source information, but we also share our information 
				for free. Please, help us keep this platform running! You can buy us a 
				coffee or donate in Bitcoin.
				</p>
					</Card>
				</Col>
				<Col span={4} />
			</Row>
		</>
	);
};
export default HomeBanner;