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
  } from 'antd';
import {
	QuestionCircleOutlined,
} from '@ant-design/icons';
import axios from 'axios';
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


const InputTitle = ({ feedtitle, onChangeTitle }) => {
	return(
		<>
			<div className="sig-form-header">
				Title*
				<span>
					<Tooltip
						placement='right'
						title='Define a name to identify this feed in your briefing'
					>
					<QuestionCircleOutlined 
						className="sig-form-info-icon"
					/>
					</Tooltip>
				</span>
			</div>
			<div className='sig-form-input'>
				<Input 
					placeholder="Enter title of your feed"
					onChange={(e) => onChangeTitle(e.target.value)}
					style={{ width: 400, }}	
					value={feedtitle}
				/>
			</div>
		</>
	);
};


const InputOrderBy = ({ feedorderby, onChangeOrderBy }) => {
	return (
		<>
			<div className="sig-form-header">
				Order articles
				<span>
					<Tooltip
						placement='right'
						title='Specify the order in which articles appear in your feed'
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
					value={feedorderby}
					style={{ width: 400, }}
					onChange={onChangeOrderBy}
					options={[
						{
							value: 'by_date',
							label: 'Chronologically by date',
						},
						{
							value: 'by_alphabet_source',
							label: 'Alphabetically by source',
						},
						{
							value: 'by_alphabet_title',
							label: 'Alphabetically by title',
						},
					]}
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
						title='Select one or more categories to include categories into your feed. If no 
						categories are selected, articles from all categories will be 
						included.'
					>
					<QuestionCircleOutlined className="sig-form-info-icon"/>
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
					placeholder="Please select"
					onChange={onChangeInclCategory}
					options={categoryoptions}
				/>
			</div>
		</>
	);
};


const SelectInclKeywords = ({ feedinclkeywordsdisabled, feedinclkeywords, onChangeInclKeywords }) => {
	return(
		<>
			<div className="sig-form-header">
				Include keywords
				<span>
					<Tooltip
						placement='right'
						title='Enter keywords to filter articles. For multiple keywords, separate 
						them with spaces (e.g. Keyword1 Keyword2 Keyword3). Note that you cannot 
						exclude keywords when defining included keywords.'
					>
					<QuestionCircleOutlined className="sig-form-info-icon" />
					</Tooltip>
				</span> 
			</div>
			<div className='sig-form-input'>
				<Input 
					placeholder="Enter keywords with a comma separated"
					disabled={feedinclkeywordsdisabled}
					onChange={(e) => onChangeInclKeywords(e.target.value)}
					style={{ width: 400, }}
					value={feedinclkeywords}	
				/>
			</div>
		</>
	);
};


const SelectExclKeywords = ({ feedexclkeywordsdisabled, feedexclkeywords, onChangeExclKeywords }) => {
	return(
		<>
			<div className="sig-form-header">
				Exclude keywords
				<span>
					<Tooltip
						placement='right'
						title='Enter keywords to exclude articles. For multiple keywords, separate 
						them with spaces (e.g. Keyword1 Keyword2 Keyword3). When excluding keywords, 
						you cannot define included keywords.'
					>
					<QuestionCircleOutlined className="sig-form-info-icon"/>
					</Tooltip>
				</span> 
			</div>
			<div className='sig-form-input'>
				<Input 
					placeholder="Enter keywords with a comma separated"
					disabled={feedexclkeywordsdisabled}
					onChange={(e) => onChangeExclKeywords(e.target.value)}
					style={{	width: 400,	}}
					value={feedexclkeywords}	
				/>
			</div>
		</>
	);
};


const SelectInclSource = ({ sourcesoptions, feedinclsource, feedinclsourcesdisabled, onChangeInclSource }) => {
	return(
		<>
			<div className="sig-form-header">
				Include sources
				<span>
					<Tooltip
						placement='right'
						title='Select one or more sources that should be included into your feed. If no sources are 
						selected, articles from all sources will be included. You can either include 
						specific sources or exclude them, but not both.'
					>
					<QuestionCircleOutlined className="sig-form-info-icon"	/>
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
					style={{ width: 400, }}
					placeholder="Please select"
					onChange={onChangeInclSource}
					options={sourcesoptions}
					value={feedinclsource}
				/>
			</div>
		</>
	);
};


const SelectExclSource = ({ feedexclsourcesdisabled, sourcesoptions, feedexclsource, onChangeExclSource }) => {
	return(
		<>
			<div className="sig-form-header">
				Exclude sources
				<span>
					<Tooltip
						placement='right'
						title='Select sources to exclude from your feed.
						If no sources are excluded, articles 
						from all sources will be included. You can either include sources or exclude 
						them, but not both.'
					>
					<QuestionCircleOutlined className="sig-form-info-icon" />
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
					placeholder="Please select"
					onChange={onChangeExclSource}
					options={sourcesoptions}
					value={feedexclsource}
				/>
			</div>
		</>
	);
};


const SelectMinClicks = ({ feedminclicks, onChangeMinClicks }) => {
	return (
		<>
			<div className="sig-form-header">
				Minimum number of clicks
				<span>
					<Tooltip
						placement='right'
						title='Filter articles to show only those with a higher number of selected clicks'
					>
					<QuestionCircleOutlined className="sig-form-info-icon" />
					</Tooltip>
				</span>
			</div>
			<div className='sig-form-input'>
				<Select
					className='sig-form-select'
					value={feedminclicks}
					style={{ width: 400, }}
					onChange={onChangeMinClicks}
					options={[
						{value: 0,label: '0',},{value: 10,label: '10',},{
						value: 50,label: '50',},{value: 100,label: '100',},{
						value: 500,label: '500',},
					]}
				/>
			</div>
		</>
	);
};


const SelectMinUserRating = ({ feedminuserrating, onChangeMinUserRating }) => {
	const options_min_user_rating = Array.from({ length: 10 }, (_, i) => {
		const value = (i * 0.5);
		return { value, label: value };
	});
	return (
		<>
			<div className="sig-form-header">
				Minimum average user rating
				<span>
					<Tooltip
						placement='right'
						title='Filter articles to show only those with a higher average user rating'
					>
					<QuestionCircleOutlined className="sig-form-info-icon"	/>
					</Tooltip>
				</span>
			</div>
			<div className='sig-form-input'>
				<Select
					className='sig-form-select'
					value={feedminuserrating}
					style={{	width: 400,	}}
					onChange={onChangeMinUserRating}
					options={options_min_user_rating}
				/>
			</div>
		</>
	);
};


const SelectMinAlgoRating = ({ feedminalgorating, onChangeMinAlgoRating }) => {
	const options_min_algo_rating = Array.from({ length: 10 }, (_, i) => {
		const value = (i * 0.5);
		return { value, label: value };
	});
	return (
		<>
			<div className="sig-form-header">
				Minimum algorithm rating
				<span>
					<Tooltip
						placement='right'
						title='Filter articles to show only those with an algorithmic rating 
						above the selected value. The algorithmic rating evaluates articles based 
						on objective criteria, including information density, article length and 
						other factors.'
					>
					<QuestionCircleOutlined className="sig-form-info-icon"	/>
					</Tooltip>
				</span>
			</div>
			<div className='sig-form-input'>
				<Select
					className='sig-form-select'
					value={feedminalgorating}
					style={{	width: 400,	}}
					onChange={onChangeMinAlgoRating}
					options={options_min_algo_rating}
				/>
			</div>
		</>
	);
};


const SelectMinSourceRating = ({ feedminsourcerating, onChangeMinSourceRating }) => {
	const options_min_source_rating = Array.from({ length: 10 }, (_, i) => {
		const value = (i * 0.5);
		return { value, label: value };
	});	
	return (
		<>
			<div className="sig-form-header">
				Minimum source rating
				<span>
					<Tooltip
						placement='right'
						title='Filter articles to show only those from sources with an average user 
						rating above the selected value. The source rating reflects the overall 
						rating of all articles published by that source.'
					>
					<QuestionCircleOutlined className="sig-form-info-icon"	/>
					</Tooltip>
				</span>
			</div>
			<div className='sig-form-input'>
				<Select
					className='sig-form-select'
					value={feedminsourcerating}
					style={{	width: 400,	}}
					onChange={onChangeMinSourceRating}
					options={options_min_source_rating}
				/>
			</div>
		</>
	);
};


const DashboardFeedAddApp = () => {
	const { isauthenticated, user } = useAuth();
	const [feedtitle, setFeedTitle] = useState('');
	const [feedorderby, setFeedOrderBy] = useState('by_date');
	const [feedinclcategory, setFeedInclCategory] = useState([]);
	const [feedinclkeywords, setFeedInclKeywords] = useState('');
	const [feedexclkeywords, setFeedExclKeywords] = useState('');
	const [feedinclsource, setFeedInclSource] = useState([]);
	const [feedexclsource, setFeedExclSource] = useState([]);
	const [feedminclicks, setFeedMinClicks] = useState(0);
	const [feedminuserrating, setFeedMinUserRating] = useState(0);
	const [feedminalgorating, setFeedMinAlgoRating] = useState(0);
	const [feedminsourcerating, setFeedMinSourceRating] = useState(0);
	
	const [categoryoptions, setCategoryOptions] = useState([]);
	const [sourcesoptions, setSourceOptions] = useState([]);
	
	const [showalert, setShowAlert] = useState(false);
	const [alertmessage, setAlertMessage] = useState('');
	const [alerttype, setAlertType] = useState('');
	const [alertdescription, setAlertDescription] = useState('');
	const [showmoretext, setShowMoreText] = useState('Show more filters');
	const [showfilters, setShowFilters] = useState(false);

	const [feedinclkeywordsdisabled, setFeedInclKeywordsDisabled] = useState(false);
	const [feedexclkeywordsdisabled, setFeedExclKeywordsDisabled] = useState(false);
	const [feedinclsourcesdisabled, setFeedInclSourcesDisabled] = useState(false);
	const [feedexclsourcesdisabled, setFeedExclSourcesDisabled] = useState(false);


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
				const response = await axios.get('/api/NewsAddEditFeedSourcesAll');
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


	const onChangeTitle = (value) => {
		setFeedTitle(value);
	};


	const onChangeOrderBy = (value) => {
		setFeedOrderBy(value);
	};


	const onChangeInclCategory = (value) => {
		setFeedInclCategory(value);
	};


	const onChangeInclKeywords = (value) => {
		if (value !== '') {
			setFeedExclKeywordsDisabled(true);
		} else {
			setFeedExclKeywordsDisabled(false);
		};
		setFeedInclKeywords(value);
	};


	const onChangeExclKeywords = (value) => {
		if (value !== '') {
			setFeedInclKeywordsDisabled(true);
		} else {
			setFeedInclKeywordsDisabled(false);
		};
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


	const onShowAlert = (message, description, type, show) => {
		setAlertMessage(message);
		setAlertDescription(description);
		setAlertType(type)
		setShowAlert(show);
	};


	const handleClearFields = () => {
		setFeedTitle('');
		setFeedOrderBy('by_date');
		setFeedInclCategory([]);
		setFeedInclKeywords('');
		setFeedExclKeywords('');
		setFeedInclSource([]);
		setFeedExclSource([]);
		setFeedMinClicks(0);
		setFeedMinUserRating(0);
		setFeedMinAlgoRating(0);
		setFeedMinSourceRating(0);
		setFeedInclKeywordsDisabled(false);
		setFeedExclKeywordsDisabled(false);
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


	const checkFilterApplied = () => {
		return (
			feedinclcategory.length > 0 ||
			feedinclkeywords.trim() !== '' ||
			feedexclkeywords.trim() !== '' ||
			feedinclsource.length > 0 ||
			feedexclsource.length > 0 ||
			Number(feedminclicks) > 0 ||
			Number(feedminuserrating) > 0 ||
			Number(feedminalgorating) > 0
		);
	};			


	const handleSaveFeed = async () => {
		if (!isauthenticated) return;

		const isTitleValid = feedtitle.trim().length > 0;
		const isFeedValid = isTitleValid && checkFilterApplied();

		if (!isTitleValid) {
			window.scrollTo({top: 0,behavior: "smooth"});
			onShowAlert('Error', 'Please provide a title for your feed', 'error', true);
			return;
		};

		if (!isFeedValid) {
			window.scrollTo({top: 0,behavior: "smooth"});
			onShowAlert('Error', 'Please apply at least one filter', 'error', true);
			return;
		};

		if (isFeedValid && isTitleValid) {
			onShowAlert('', '', 'success', false);
		};
		
		try {
			const response = await axios.post(`/api/DashboardUserFeed/`, {
				title: String(feedtitle),
				order_by: String(feedorderby), 
				category_included: feedinclcategory, 
				tags_included: feedinclkeywords
					? feedinclkeywords.split(/[ ,]+/).filter(Boolean)
					: [],

				tags_excluded: feedexclkeywords
					? feedexclkeywords.split(/[ ,]+/).filter(Boolean)
					: [],
				source_included: feedinclsource, 
				source_excluded: feedexclsource, 
				min_clicks: Number(feedminclicks), 
				min_rating: Number(feedminuserrating), 
				min_algo_rating: Number(feedminalgorating), 
				min_source_rating: Number(feedminsourcerating),				
			},
			{	
				withCredentials: true,
				headers: {
					'X-CSRFToken': csrftoken,
				}
			});
			if (response.status === 201) {
				window.scrollTo({top: 0,behavior: "smooth"});
				onShowAlert('Success', 'Feed saved', 'success', true);
				handleClearFields();
			}
		} catch(error) {
			window.scrollTo({top: 0,behavior: "smooth"});
			console.error('Failed to save feed');
			onShowAlert('Error', 'Failed to save feed. Please try again later!', 'error', true);
		};
	};


	return (
		<>
			<Layout>
				<Card
					style={{ borderColor: '#FFF', }}
					bodyStyle={{ paddingTop: 10, paddingLeft: 10, }}
				>
				{
					showalert && (
						<div className='sig-form-alert'>
						<Alert
							message={alertmessage}
							description={alertdescription}
							type={alerttype}
							showIcon
						/>
						</div>
					)
				}

				<Row>
					<Col span={12}>
						<InputTitle 
							feedtitle={feedtitle}
							onChangeTitle={onChangeTitle}
						/>
					</Col>
					<Col span={12}>
						<InputOrderBy 
							feedorderby={feedorderby}
							onChangeOrderBy={onChangeOrderBy}
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
						<SelectInclKeywords 
							feedinclkeywordsdisabled={feedinclkeywordsdisabled}
							feedinclkeywords={feedinclkeywords}
							onChangeInclKeywords={onChangeInclKeywords}
						/>
					</Col>
					<Col span={12}>
						<SelectExclKeywords 
							feedexclkeywordsdisabled={feedexclkeywordsdisabled}
							feedexclkeywords={feedexclkeywords}
							onChangeExclKeywords={onChangeExclKeywords}
						/>
					</Col>
				</Row>
				
				<div>
					<span className='sig-form-more-filters' onClick={onShowAdditionalFilters} >
					{showmoretext}
					</span>
				</div>

				{
					(showfilters)  && (
					<>
						<Divider />
						
						<Row>
							<Col span={12}>
							<SelectInclSource 
								sourcesoptions={sourcesoptions}
								feedinclsource={feedinclsource}
								feedinclsourcesdisabled={feedinclsourcesdisabled}
								onChangeInclSource={onChangeInclSource}
							/>
							</Col>
							<Col span={12}>
							<SelectExclSource 
								feedexclsourcesdisabled={feedexclsourcesdisabled}
								sourcesoptions={sourcesoptions}
								feedexclsource={feedexclsource}
								onChangeExclSource={onChangeExclSource}
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
					)
				}
				
				<Divider />

					<Row style={{ marginTop: 25, }}>
						<Col span={12}>
							<Button 
								type='primary'
								onClick={handleSaveFeed}
							>
							Save feed 
							</Button>

							<Button 
								type='secondary'
								style={{ marginLeft: 20, }}
								onClick={handleClearFields}
							>
							Clear all fields 
							</Button>
						</Col>
					</Row>

				</Card>
			</Layout>
		</>
	);
};
export default DashboardFeedAddApp;


