import React, { useState, useEffect } from 'react';
import {
	Card,
	Input,
	Button,
	Row,
	Col,
	Layout,
	Tooltip,
	Divider,
	Alert,
	Select,
	DatePicker,
  } from 'antd';
import {
	QuestionCircleOutlined,
} from '@ant-design/icons';
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthProvider.js";
import moment from 'moment-timezone';


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


const InputSearch = ({ searchinput, onChangeSearchInput, handleSearch }) => {
	return(
		<>

			<div className='sig-form-input'>
				<Input 
					placeholder="The world’s largest database with high-quality news and analysis"
					onChange={(e) => onChangeSearchInput(e.target.value)}
					style={{
						marginTop: 30,
						width: '100%',
					}}	
					value={searchinput}
					onKeyDown={(e) => {
							if (e.key === 'Enter') {
									handleSearch();
							}
					}}
				/>
			</div>
		</>
	);
};


const HomeSearchApp = () => {
	const { isauthenticated, user } = useAuth();
	const [searchinput, setSearchInput] = useState('');
	const [searchbuttoninfo, setSearchButtonInfo] = useState('');
	
	const [showalert, setShowAlert] = useState(false);
	const [alertmessage, setAlertMessage] = useState('');
	const [alerttype, setAlertType] = useState('');
	const [alertdescription, setAlertDescription] = useState('');
	
	const [showfilters, setShowFilters] = useState(false);
	const [feedinclsourcesdisabled, setFeedInclSourcesDisabled] = useState(false);
	const [feedexclsourcesdisabled, setFeedExclSourcesDisabled] = useState(false);
	
	const navigate = useNavigate();


	const onChangeSearchInput = (value) => {
		setSearchInput(value);
	};


	const navigate_search_page = () => {
		window.scrollTo({top: 0,behavior: "smooth"});
		navigate("/search-results");
	};


	const handleSearch = () => {
		
		const isSearchInputValid = searchinput.trim().length > 0;
		
		if (!isSearchInputValid) {
			setSearchButtonInfo('Please provide at least one keyword for your search');
			return;
		};

		if (isSearchInputValid) {
			setSearchButtonInfo('');
		};
		
		const params = new URLSearchParams()
		params.set("q", searchinput);

		window.scrollTo({top: 0,behavior: "smooth"});
		navigate(`/search-results?${params.toString()}`);
	};


	const navigateAdvancedSearch = () => {
		navigate(`/dashboard/search`);
		window.scrollTo({top: 0,behavior: "smooth"});
	};


	return (
		<>
			<Layout style={{ background: "transparent" }}>
				<Card className={"home-search-card"}>
					<Row>
						<Col span={24}>		
						
						<h1 className="home-header-search" style={{ textAlign: "center", marginTop: 0, }}>SEARCH</h1>
						
						<div className="home-search-engine-container" >
							
						<InputSearch 
							searchinput={searchinput}
							onChangeSearchInput={onChangeSearchInput}
							handleSearch={handleSearch}
						/>

						<Button 
							type='primary'
							onClick={() => handleSearch()}
							style={{ marginTop: 35, marginLeft: 15 }}
						>
						Search
						</Button>
						</div>
							
						</Col>
					</Row>
				
					<div className="home-search-info-container">
						<p>
						<span
							className='sig-form-more-filters'
							onClick={navigateAdvancedSearch}
							style={{ textAlign: "left", flex: 1}}
						>
						Advanced search
						</span>
						</p>	
					</div>
					
					<div className="home-search-engine-info">
							{searchbuttoninfo}
					</div>
						
				</Card>
			</Layout>
		</>
	);
};
export default HomeSearchApp;


