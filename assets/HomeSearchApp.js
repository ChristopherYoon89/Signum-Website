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


const InputSearch = ({ searchinput, onChangeSearchInput }) => {
	return(
		<>

			<div className='sig-form-input'>
				<Input 
					placeholder="Enter keywords separated by spaces"
					onChange={(e) => onChangeSearchInput(e.target.value)}
					style={{
						marginTop: 30,
						width: '100%',
					}}	
					value={searchinput}
				/>
			</div>
		</>
	);
};


const DatePickerStart = ({ startdate, onChangeStartDate }) => {
	return (
		<>
			<div className="sig-form-header">
				From startdate
				<span>
					<Tooltip
						placement='right'
						title='Filter articles by publication date. Select a start and/or end date to define the time range.'
					>
					<QuestionCircleOutlined 
						className="sig-form-info-icon"
					/>
					</Tooltip>
				</span>
			</div>
			<div className='sig-form-input'>
				<DatePicker 
					onChange={onChangeStartDate} 
					value={startdate}
					allowClear
				/>
			</div>
		</>
	);
};


const DatePickerEnd = ({ enddate, onChangeEndDate }) => {
	return (
		<>
			<div className="sig-form-header">
				To enddate
			</div>
			<div className='sig-form-input'>
				<DatePicker 
					onChange={onChangeEndDate}
					value={enddate}
					allowClear
				/>
			</div>
		</>
	);
};


const SelectInclCategory = ({ feedinclcategory, onChangeInclCategory, categoryoptions }) => {
	return(
		<>
			<div className="sig-form-header">
				Include categories 
				<span>
					<Tooltip
						placement='right'
						title='Select one or more categories to filter your feed. If none are selected, 
						articles from all categories will be included'
					>
					<QuestionCircleOutlined 
						className="sig-form-info-icon"
					/>
					</Tooltip>
				</span>
			</div>
			<div className='sig-form-input'>
				<Select
					className='sig-form-select'
					mode="multiple"
					allowClear
					style={{ width: 400, }}
					value={feedinclcategory}
					placeholder="Select categories"
					onChange={onChangeInclCategory}
					options={categoryoptions}
				/>
			</div>
		</>
	);
};


const SelectExclKeywords = ({ onChangeExclKeywords, feedexclkeywords }) => {
	return(
		<>
			<div className="sig-form-header">
				Exclude keywords
				<span>
						<Tooltip
							placement='right'
							title='Exclude articles containing these keywords. Separate multiple keywords with spaces.'
						>
						<QuestionCircleOutlined 
							className="sig-form-info-icon"
						/>
						</Tooltip>
					</span> 
			</div>
			<div className='sig-form-input'>
				<Input 
					placeholder="Enter keywords separated by spaces"
					onChange={(e) => onChangeExclKeywords(e.target.value)}
					style={{ width: 400, }}
					value={feedexclkeywords}	
					/>
			</div>
		</>
	);
};


const SelectInclSource = ({ feedinclsourcesdisabled, onChangeInclSource, sourcesoptions, feedinclsource }) => {
	return(
		<>
			<div className="sig-form-header">
				Include sources
				<span>
				<Tooltip
					placement='right'
					title='Select one or more sources to include in your search. If none 
					are selected, articles from all sources will be shown. You can either include 
					sources or exclude them, but not both.'
				>
				<QuestionCircleOutlined 
					className="sig-form-info-icon"
				/>
				</Tooltip>
				</span> 
			</div>
			<div className='sig-form-input'>
				<Select
					className={
						feedinclsourcesdisabled ? 'sig-form-select-deactivated'
						: 'sig-form-select'
					}
					disabled={feedinclsourcesdisabled}
					mode="multiple"
					allowClear
					style={{
						width: 400,
					}}
					placeholder="Select sources"
					onChange={onChangeInclSource}
					options={sourcesoptions}
					value={feedinclsource}
				/>
			</div>
		</>
	);
};



const SelectExclSource = ({ feedexclsourcesdisabled, onChangeExclSource, sourcesoptions, feedexclsource }) => {
	return(
		<>
			<div className="sig-form-header">
				Exclude sources 
				<span>
				<Tooltip
					placement='right'
					title='Select one or more sources to exclude in your search. If none 
					are selected, articles from all sources will be shown. You can either include 
					sources or exclude them, but not both.'
				>
				<QuestionCircleOutlined 
					className="sig-form-info-icon"
				/>
				</Tooltip>
				</span> 
			</div>
			<div className='sig-form-input'>
				<Select
					className={
						feedexclsourcesdisabled ? 'sig-form-select-deactivated'
						: 'sig-form-select'
					}
					disabled={feedexclsourcesdisabled}
					mode="multiple"
					allowClear
					style={{ width: 400, }}
					placeholder="Select sources"
					onChange={onChangeExclSource}
					options={sourcesoptions}
					value={feedexclsource}
				/>
			</div>
		</>
	);
};


const SelectMinClicks = ({ feedminclicks, onChangeMinClicks}) => {
	return (
		<>
			<div className="sig-form-header">
				Minimum number of clicks
				<span>
				<Tooltip
					placement='right'
					title='Show only articles that have at least the selected number of clicks.'
				>
				<QuestionCircleOutlined 
					className="sig-form-info-icon"
				/>
				</Tooltip>
				</span>
			</div>
			<div className='sig-form-input'>
			<Select
				className='sig-form-select'
				value={feedminclicks}
				style={{
					width: 400,
				}}
				onChange={onChangeMinClicks}
				options={[
					{value: '0',label: '0',},{value: '10',label: '10',},{
					value: '50',label: '50',},{value: '100',label: '100',},{
					value: '500',label: '500',},
				]}
			/>
			</div>
		</>
	);
};


const SelectMinUserRating = ({ feedminuserrating, onChangeMinUserRating }) => {
	const options_min_user_rating = Array.from({ length: 10 }, (_, i) => {
		const value = (i * 0.5).toString();
		return { value, label: value };
	});
	return (
		<>
			<div className="sig-form-header">
				Minimum average user rating
				<span>
				<Tooltip
					placement='right'
					title="Filter articles to show only those with a higher average user rating."
				>
				<QuestionCircleOutlined 
					className="sig-form-info-icon"
				/>
				</Tooltip>
				</span>
			</div>
			<div className='sig-form-input'>
			<Select
				className='sig-form-select'
				value={feedminuserrating}
				style={{
					width: 400,
				}}
				onChange={onChangeMinUserRating}
				options={options_min_user_rating}
			/>
			</div>
		</>
	);
};


const SelectMinAlgoRating = ({ feedminalgorating, onChangeMinAlgoRating }) => {
	const options_min_algo_rating = Array.from({ length: 10 }, (_, i) => {
		const value = (i * 0.5).toString();
		return { value, label: value };
	});

	return (
		<>
			<div className="sig-form-header">
				Minimum algorithm rating
				<span>
				<Tooltip
					placement='right'
					title='Filter articles by minimum algorithmic rating. Ratings are calculated 
					using objective indicators such as information density and article length.'
				>
				<QuestionCircleOutlined 
					className="sig-form-info-icon"
				/>
				</Tooltip>
				</span>
			</div>
			<div className='sig-form-input'>
			<Select
				className='sig-form-select'
				value={feedminalgorating}
				style={{ width: 400, }}
				onChange={onChangeMinAlgoRating}
				options={options_min_algo_rating}
			/>
			</div>
		</>
	);
};


const SelectMinSourceRating = ({ feedminsourcerating, onChangeMinSourceRating }) => {
	const options_min_source_rating = Array.from({ length: 10 }, (_, i) => {
		const value = (i * 0.5).toString();
		return { value, label: value };
	});
	return (
		<>
			<div className="sig-form-header">
				Minimum source rating
				<span>
				<Tooltip
					placement='right'
					title='Filter articles by minimum source rating. The source rating reflects 
					the average user rating of all articles from that source.'
				>
				<QuestionCircleOutlined 
					className="sig-form-info-icon"
				/>
				</Tooltip>
				</span>
			</div>
			<div className='sig-form-input'>
			<Select
				className='sig-form-select'
				value={feedminsourcerating}
				style={{ width: 400, }}
				onChange={onChangeMinSourceRating}
				options={options_min_source_rating}
			/>
			</div>
		</>
	);
};


const HomeSearchApp = () => {
	const { isauthenticated, user } = useAuth();
	const [searchinput, setSearchInput] = useState('');
	const [userloggedinsearch, setUserLoggedInSearch] = useState('');
	
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
		navigate("/dashboard/search");
	};


	const handleSearch = () => {
		if (!isauthenticated) {
			setUserLoggedInSearch("Log in to use the engine");
			return;
		};

		window.scrollTo({top: 0,behavior: "smooth"});
		
		const isSearchInputValid = searchinput.trim().length > 0;
		
		if (!isSearchInputValid) {
			setAlertMessage('Error');
			setAlertDescription('Please provide at least one keyword for your search');
			setAlertType('error')
			setShowAlert(true);
			return;
		};

		if (isSearchInputValid) {
			setAlertMessage('');
			setAlertDescription('');
			setShowAlert(false);
		};
		
		const params = new URLSearchParams()
		params.set("q", searchinput);

		navigate(`/dashboard/search/results?${params.toString()}`);
	};


	return (
		<>
			<Layout style={{
				background: "transparent"
			}}>
				<Card className={"home-search-card"} >
					{showalert && (
						<div className='sig-form-alert'>
						<Alert 
							message={alertmessage}
							description={alertdescription}
							type={alerttype}
							showIcon
						/>
						</div>
					)}
					<Row>
						<Col span={24}>
						<InputSearch 
							searchinput={searchinput}
							onChangeSearchInput={onChangeSearchInput}
						/>

						<Button 
								type='primary'
								onClick={handleSearch}
								style={{ marginTop: 25, }}
							>
							Search
							</Button>

							<span className="home-search-engine-info">
								{userloggedinsearch}
							</span>
						</Col>
					</Row>
				
					<div>
						<span
							className='sig-form-more-filters'
							onClick={navigate_search_page}
						>
						Advanced search
						</span>
					</div>
					
				</Card>
			</Layout>
		</>
	);
};
export default HomeSearchApp;


