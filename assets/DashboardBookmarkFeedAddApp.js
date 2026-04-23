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
						title='Define a name to identify this bookmark feed'
					>
					<QuestionCircleOutlined 
						className="sig-form-info-icon"
					/>
					</Tooltip>
				</span>
			</div>
			<div className='sig-form-input'>
				<Input 
					placeholder="Enter title of your bookmark feed"
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
				Order bookmarks
				<span>
					<Tooltip
						placement='right'
						title='Specify the order in which bookmarks appear in your feed'
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
							value: 'by_date_of_upload',
							label: 'By date of upload',
						},
						{
							value: 'by_date_of_bookmark_added',
							label: 'By date when bookmark was added',
						},
					]}
				/>
			</div>
		</>
	);
};



const DashboardBookmarkFeedAddApp = () => {
	const { isauthenticated, user } = useAuth();
	const [feedtitle, setFeedTitle] = useState('');
	const [feedorderby, setFeedOrderBy] = useState('by_date_of_bookmark_added');
	const [showalert, setShowAlert] = useState(false);
	const [alertmessage, setAlertMessage] = useState('');
	const [alerttype, setAlertType] = useState('');
	const [alertdescription, setAlertDescription] = useState('');


	const onChangeTitle = (value) => {
		setFeedTitle(value);
	};


	const onChangeOrderBy = (value) => {
		setFeedOrderBy(value);
	};


	const onShowAlert = (message, description, type, show) => {
		setAlertMessage(message);
		setAlertDescription(description);
		setAlertType(type)
		setShowAlert(show);
	};


	const handleClearFields = () => {
		setFeedTitle('');
		setFeedOrderBy('by_date_of_bookmark_added');
	};


	const handleSaveFeed = async () => {
		if (!isauthenticated) return 
		
		const isTitleValid = feedtitle.trim().length > 0;

		if (!isTitleValid) {
			window.scrollTo({top: 0,behavior: "smooth"});
			onShowAlert('Error', 'Please provide a title for your feed', 'error', true);
			return;
		};


		if (isTitleValid) {
			onShowAlert('', '', 'success', false);
		};
		
		try {
			const response = await axios.post(`/api/BookmarkFeedUser/`, {
				title: String(feedtitle),
				order_by: String(feedorderby), 				
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
			onShowAlert('Error', 'Failed to save bookmark feed. Please try again later!', 'error', true);
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

				<Row style={{ marginTop: 25, }}>
					<Col span={12}>
						<Button 
							type='primary'
							onClick={handleSaveFeed}
						>
						Save bookmark feed 
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
export default DashboardBookmarkFeedAddApp;


