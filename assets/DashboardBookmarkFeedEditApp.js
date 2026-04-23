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
	Checkbox,
  } from 'antd';
import {
	QuestionCircleOutlined,
} from '@ant-design/icons';
import axios from 'axios';
import { useNavigate, useParams } from "react-router-dom";
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
				Title
				<span>
					<Tooltip
						placement='right'
						title='Define a name to identify the feed in your briefing'
					>
					<QuestionCircleOutlined className="sig-form-info-icon"	/>
					</Tooltip>
				</span>
			</div>
			<div className='sig-form-input'>
				<Input 
					placeholder="Enter title of your feed"
					onChange={(e) => onChangeTitle(e.target.value)}
					style={{	width: 400,	}}	
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
				Order bookmarks
				<span>
					<Tooltip
						placement='right'
						title='Specify the order in which bookmarks appear in your feed'
					>
					<QuestionCircleOutlined className="sig-form-info-icon" />
					</Tooltip>
				</span>
			</div>
			<div className='sig-form-input'>
				<Select
					className='sig-form-select'
					value={feedorderby}
					style={{	width: 400,	}}
					onChange={onChangeOrderBy}
					options={[
						{
							value: 'by_date_of_bookmark_added',
							label: 'By date of bookmark added',
						},
						{
							value: 'by_date_of_upload',
							label: 'By date of upload',
						},
					]}
				/>
			</div>
		</>
	);
};


const CompPublishFeed = ({ publishfeed, onChangePublishFeed }) => {
	return(
		<>			
			<span>
				<Checkbox checked={publishfeed} disabled={false} onChange={onChangePublishFeed}>
				Publish Feed 
				<Tooltip
					placement='right'
					title='Uncheck box if you do not want to display feed'
				>
				<QuestionCircleOutlined className="sig-form-info-icon"	/>
				</Tooltip>
				</Checkbox>
			</span>
		</>
	);
};



const DashboardBookmarkFeedEditApp = () => {
	const { isauthenticated, user } = useAuth();
	const [selectedfeed, setSelectedFeed] = useState('');
	const [feedtitle, setFeedTitle] = useState('');
	const [feedorderby, setFeedOrderBy] = useState('');
	const [publishfeed, setPublishFeed] = useState(false);
	
	const [showalert, setShowAlert] = useState(false);
	const [alertmessage, setAlertMessage] = useState('');
	const [alerttype, setAlertType] = useState('');
	const [alertdescription, setAlertDescription] = useState('');
	
	const navigate = useNavigate();
	const { feed_id } = useParams();


	useEffect(() => {
		const fetchSingleFeed = async (feed_id) => {
			if (!isauthenticated) return; 

			try {
				const response = await axios.get(`/api/BookmarkFeedUser/${feed_id}/`, {
						withCredentials: true,
						headers: { "X-CSRFToken": csrftoken },
					});
				
				const feed = response.data;
				setFeedTitle(feed.title || '');
				setFeedOrderBy(feed.order_by || '');
				setPublishFeed(feed.publish_boolean)

				} catch (error) {
				console.error('Failed to fetch single feed');
			}
		};
		fetchSingleFeed(feed_id)
	}, [feed_id])


	const onChangeTitle = (value) => {
		setFeedTitle(value);
	};


	const onChangeOrderBy = (value) => {
		setFeedOrderBy(value);
	};


	const onChangePublishFeed = (value) => {
		setPublishFeed(!publishfeed);
	};


	const cancelEditFeed = () => {
		navigate('/dashboard/bookmarks/');
	};


	const onShowAlert = (message, description, type, show) => {
		setAlertMessage(message);
		setAlertDescription(description);
		setAlertType(type)
		setShowAlert(show);
	};


	const onNavigateDelete = (feed_id) => {
		navigate(`./delete-feed`);
	};


	const handleUpdateFeed = async () => {
		if (!isauthenticated) return;

		const isTitleValid = feedtitle.trim().length > 0;

		if (!isTitleValid) {
			window.scrollTo({top: 0,behavior: "smooth"});
			onShowAlert('Error', 'Please provide a title for your feed', 'error', true);
			return;
		};

		if (isTitleValid) {
			onShowAlert('', '', '', false);
		};
		
		try {
			const response = await axios.patch(`/api/BookmarkFeedUser/${feed_id}/`,
			{
				title: String(feedtitle),
				order_by: String(feedorderby),
				publish_boolean: Boolean(publishfeed),
			},
			{
				withCredentials: true,
				headers: { "X-CSRFToken": csrftoken, },
			}
		);
		if (response.status === 200) {
			window.scrollTo({top: 0,behavior: "smooth"});
			onShowAlert('Success', 'Update saved', 'success', true);
		}
		} catch (error) {
			window.scrollTo({top: 0,behavior: "smooth"});
			onShowAlert('Error', 'Failed to update feed', 'error', true);
		}
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
					
				<div>
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
							<CompPublishFeed 
								publishfeed={publishfeed}
								onChangePublishFeed={onChangePublishFeed}
							/>
						</Col>	
					</Row>		

					<Divider />

					<Row style={{ marginTop: 25, }}>
						<Col span={12}>
							<Button 
								type='primary'
								onClick={handleUpdateFeed}
							>
							Save changes 
							</Button>

							<Button 
								type='secondary'
								style={{ marginLeft: 20, }}
								onClick={cancelEditFeed}
							>
							Cancel
							</Button>

							<Button 
								type="secondary"
								style={{ marginLeft: 20, }}
								onClick={() => onNavigateDelete(feed_id)}
							>
							Delete
							</Button>
						</Col>
					</Row>
				</div>
	
				</Card>
			</Layout>
		</>
	);
};
export default DashboardBookmarkFeedEditApp;


