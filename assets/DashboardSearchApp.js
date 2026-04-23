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
			<div className="sig-form-header">
				Search keywords*
				<span>
					<Tooltip
						placement='right'
						title='Search article titles and tags using one or more keywords. Separate multiple keywords with spaces.'
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
					onChange={(e) => onChangeSearchInput(e.target.value)}
					style={{
						width: 400,
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


const DashboardSearchApp = () => {
	const { isauthenticated, user } = useAuth();
	const [searchinput, setSearchInput] = useState('');
	const [startdate, setStartDate] = useState(null);
	const [enddate, setEndDate] = useState(moment(Date.now()));
	const [feedinclcategory, setFeedInclCategory] = useState([]);
	const [feedexclkeywords, setFeedExclKeywords] = useState('');
	const [feedinclsource, setFeedInclSource] = useState([]);
	const [feedexclsource, setFeedExclSource] = useState([]);
	const [feedminclicks, setFeedMinClicks] = useState('0');
	const [feedminuserrating, setFeedMinUserRating] = useState('0');
	const [feedminalgorating, setFeedMinAlgoRating] = useState('0');
	const [feedminsourcerating, setFeedMinSourceRating] = useState('0');

	const [categoryoptions, setCategoryOptions] = useState([]);
	const [sourcesoptions, setSourceOptions] = useState([]);
	
	const [showalert, setShowAlert] = useState(false);
	const [alertmessage, setAlertMessage] = useState('');
	const [alerttype, setAlertType] = useState('');
	const [alertdescription, setAlertDescription] = useState('');
	
	const [showmoretext, setShowMoreText] = useState('Show more filters');
	const [showfilters, setShowFilters] = useState(false);
	const [feedinclsourcesdisabled, setFeedInclSourcesDisabled] = useState(false);
	const [feedexclsourcesdisabled, setFeedExclSourcesDisabled] = useState(false);
	
	const navigate = useNavigate();


	useEffect(() => {
		const fetchCategories = async () => {
			try {
				const response = await axios.get('/api/Category');
				const mappedcategories = response.data.map((row) => ({
						value: row.id,
						label: row.name,
					}));
				setCategoryOptions(mappedcategories);
			} catch (error) {
				console.error("Failed to fetch categories");
			}
		};
		fetchCategories();
	}, []);


	useEffect(() => {
		const fetchSources = async () => {
			try {
				const response = await axios.get('/api/NewsSourcesAll');
				const mappedsources = response.data.map((row) => ({
						value: row.id,
						label: row.name,
					}));
				setSourceOptions(mappedsources);
			} catch (error) {
				console.error("Failed to fetch news sources");
			}
		};
		fetchSources();
	}, []);


	const onChangeSearchInput = (value) => {
		setSearchInput(value);
	};


	const onChangeInclCategory = (value) => {
		setFeedInclCategory(value);
	};


	const onChangeExclKeywords = (value) => {
		setFeedExclKeywords(value);
	};


	const onChangeInclSource = (value) => {
		if (value.length > 0) {
			setFeedExclSourcesDisabled(true);
		} else {
			setFeedExclSourcesDisabled(false);
		};
		setFeedInclSource(value);
	};


	const onChangeExclSource = (value) => {
		if (value.length > 0) {
			setFeedInclSourcesDisabled(true);
		} else {
			setFeedInclSourcesDisabled(false);
		};
		setFeedExclSource(value);
	};


	const onChangeMinClicks = (value) => {
		setFeedMinClicks(value);
	};


	const onChangeMinUserRating = (value) => {
		setFeedMinUserRating(value);
	};


	const onChangeMinAlgoRating = (value) => {
		setFeedMinAlgoRating(value);
	};


	const onChangeMinSourceRating = (value) => {
		setFeedMinSourceRating(value);
	};


	const onChangeStartDate = (date, datestring) => {
		if (!date) {
			setStartDate(null);
			return;
		}
		setStartDate(moment(datestring));
	};


	const onChangeEndDate = (date, datestring) => {
		if (!date) {
			setEndDate(null);
			return;
		}
		setEndDate(moment(datestring));
	};


	const handleClearFields = () => {
		window.scrollTo({top: 0,behavior: "smooth"});
		setSearchInput('');
		setStartDate(null);
		setEndDate(moment(Date.now()));
		setFeedInclCategory([]);
		setFeedExclKeywords('');
		setFeedInclSource([]);
		setFeedExclSource([]);
		setFeedMinClicks('0');
		setFeedMinUserRating('0');
		setFeedMinAlgoRating('0');
		setFeedMinSourceRating('0');
		setFeedInclSourcesDisabled(false);
		setFeedExclSourcesDisabled(false);
	};
	

	const onShowAdditionalFilters = () => {
		if (showmoretext === 'Show more filters') {
			setShowMoreText('Show less filters');
			setShowFilters(true);
		} else if (showmoretext === 'Show less filters') {
			setShowMoreText('Show more filters');
			setShowFilters(false);
		};
	};


	const handleSearch = () => {
		if (!isauthenticated) return;

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

		if (startdate)
			params.set("startdate", startdate.toISOString());

		if (enddate)
			params.set("enddate", enddate.toISOString());

		if (feedinclcategory.length)
			params.set("category", feedinclcategory);

		if (feedexclkeywords)
			params.set("keywords_excluded", feedexclkeywords);

		if (feedinclsource.length)
			params.set("source_included", feedinclsource);

		if (feedexclsource.length)
			params.set("source_excluded", feedexclsource);

		params.set("min_clicks", feedminclicks);
		params.set("min_rating", feedminuserrating);
		params.set("min_algo_rating", feedminalgorating);
		params.set("min_source_rating", feedminsourcerating);

		navigate(`results?${params.toString()}`);
	};


	return (
		<>
			<Layout>
				<Card
					style={{ borderColor: '#FFF', }}
					bodyStyle={{ paddingTop: 10, paddingLeft: 10, }}
				>
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
						<Col span={12}>
						<InputSearch 
							searchinput={searchinput}
							onChangeSearchInput={onChangeSearchInput}
						/>
						</Col>
					</Row>
				
					<div>
						<span
							className='sig-form-more-filters'
							onClick={onShowAdditionalFilters}
						>
						{showmoretext}
						</span>
					</div>

					{(showfilters)  && (
					<>
					<Divider />

					<Row>
						<Col span={12}>
							<DatePickerStart 
								startdate={startdate} 
								onChangeStartDate={onChangeStartDate}
							/>	
						</Col>
						<Col span={12}>
							<DatePickerEnd 
								enddate={enddate}
								onChangeEndDate={onChangeEndDate}
							/>
						</Col>
					</Row>

					<Divider />

					<Row>
						<Col span={12}>
							<SelectInclCategory 
								feedinclcategory={feedinclcategory} 
								onChangeInclCategory={onChangeInclCategory}
								categoryoptions={categoryoptions}
							/>
						</Col>
					</Row>
						
					<Divider />
						
					<Row>
						<Col span={12}>
							<SelectExclKeywords 
								onChangeExclKeywords={onChangeExclKeywords} 
								feedexclkeywords={feedexclkeywords}
							/>
						</Col>
					</Row>

					<Divider />
					
					<Row>
						<Col span={12}>
							<SelectInclSource 
								feedinclsourcesdisabled={feedinclsourcesdisabled} 
								onChangeInclSource={onChangeInclSource} 
								sourcesoptions={sourcesoptions} 
								feedinclsource={feedinclsource}
							/>
						</Col>
						<Col span={12}>
							<SelectExclSource 
								feedexclsourcesdisabled={feedexclsourcesdisabled} 
								onChangeExclSource={onChangeExclSource} 
								sourcesoptions={sourcesoptions} 
								feedexclsource={feedexclsource}
							/>
						</Col>
					</Row>

					<Divider />
					
					<Row>
						<Col span={12}>
							<SelectMinClicks 
								feedminclicks={feedminclicks}
								onChangeMinClicks={onChangeMinClicks}
							/>
						</Col>
						<Col span={12}>
							<SelectMinUserRating 
								feedminuserrating={feedminuserrating} 
								onChangeMinUserRating={onChangeMinUserRating}
							/>
						</Col>
					</Row>

					<Row style={{ marginTop: 25, }}>
						<Col span={12}>
							<SelectMinAlgoRating 
								feedminalgorating={feedminalgorating} 
								onChangeMinAlgoRating={onChangeMinAlgoRating}
							/>
						</Col>
						<Col span={12}>
							<SelectMinSourceRating 
								feedminsourcerating={feedminsourcerating} 
								onChangeMinSourceRating={onChangeMinSourceRating}
							/>
						</Col>
					</Row>
					</>
					)}
					
					<Divider />

					<Row style={{ marginTop: 25, }}>
						<Col span={12}>
							<Button 
								type='primary'
								onClick={handleSearch}
							>
							Search
							</Button>

							<Button 
								type='secondary'
								style={{ marginLeft: 20, }}
								onClick={handleClearFields}
							>
							Clear all filters
							</Button>
						</Col>
					</Row>
				</Card>
			</Layout>
		</>
	);
};
export default DashboardSearchApp;


