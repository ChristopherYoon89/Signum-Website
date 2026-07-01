import React, { useState } from 'react';
import {
	Card,
	Button,
	Row,
	Col,
	Layout,
	Divider,
	Alert,
  } from 'antd';
import axios from 'axios';
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "./AuthProvider.js";
import { getCookie } from './ManagerUtility.js';


var csrftoken = getCookie('csrftoken');


const DashboardBookmarkFeedDeleteApp = () => {
	const { isauthenticated, user } = useAuth();
	const [showalert, setShowAlert] = useState(false);
	const [alertmessage, setAlertMessage] = useState('');
	const [alerttype, setAlertType] = useState('');
	const navigate = useNavigate();
	const { feed_id } = useParams();


	const onShowAlert = (message, type, show) => {
		setAlertMessage(message);
		setAlertType(type)
		setShowAlert(show);
	};


	const onNavigateBookmarkfeed = () => {
		navigate('/dashboard/bookmarks');
	};


	const onNavigateBookmarkEdit = () => {
		navigate(`/dashboard/bookmarks/editfeed/${feed_id}`);
	};


	const handleDeleteFeed = async () => {
		if (!isauthenticated) return;

		try {
			const response = await axios.delete(
				`/api/BookmarkFeedUser/${feed_id}/`,
				{
					withCredentials: true,
					headers: { "X-CSRFToken": csrftoken }
				}
			);

			if (response.status === 204) {
				window.scrollTo({ top: 0, behavior: "smooth" });
				onNavigateBookmarkfeed();
			}

		} catch (error) {
			window.scrollTo({ top: 0, behavior: "smooth" });
			onShowAlert('Failed to delete feed', 'error', true);
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
							<legend>Deleting Bookmark Feed</legend>
							<p>
							Are you sure you want to delete this bookmark feed?
							</p>
							<p>
							Deleting this bookmark feed will permanently remove all bookmarks in this feed.
							</p>
						</Col>
					</Row>

					<Divider />

					<Row style={{ marginTop: 25, }}>
						<Col span={12}>
							<Button 
								type="primary"
								className="ant-btn-dangerous"
								style={{ marginLeft: 20, }}
								onClick={() => handleDeleteFeed() }
								danger 
							>
							Delete
							</Button>

							<Button 
								type='secondary'
								style={{ marginLeft: 20, }}
								onClick={() => onNavigateBookmarkfeed() }
							>
							Cancel
							</Button>
						</Col>
					</Row>
				</div>
				</Card>
			</Layout>
		</>
	);
};
export default DashboardBookmarkFeedDeleteApp;


