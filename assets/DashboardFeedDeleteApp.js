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



const DashboardFeedDeleteApp = () => {
	const { isauthenticated, user } = useAuth();

	const [showalert, setShowAlert] = useState(false);
	const [alertmessage, setAlertMessage] = useState('');
	const [alerttype, setAlertType] = useState('');
	const [alertdescription, setAlertDescription] = useState('');
	const { feed_id } = useParams();
	const navigate = useNavigate();


	const onShowAlert = (message, description, type, show) => {
		setAlertMessage(message);
		setAlertDescription(description);
		setAlertType(type)
		setShowAlert(show);
	};


	const onNavigateBriefingFeed = () => {
		navigate('/dashboard/briefing');
	};


	const onNavigateFeedEdit = () => {
		navigate(`/dashboard/briefing/editfeed/${feed_id}`);
	};


	const handleDeleteFeed = async () => {
		if (!isauthenticated) return;

		try {
			const response = await axios.delete(
				`/api/FeedSingle/${feed_id}/`,
				{
					withCredentials: true,
					headers: { "X-CSRFToken": csrftoken }
				}
			);

			if (response.status === 204) {
				window.scrollTo({ top: 0, behavior: "smooth" });
				onNavigateBriefingFeed();
			}

		} catch (error) {
			window.scrollTo({ top: 0, behavior: "smooth" });
			onShowAlert('Error', 'Failed to delete feed', 'error', true);
		}
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
					
					<div>
					<Row>
						<Col span={12}>						
							<legend>Deleting Feed</legend>
							<p>
							Are you sure that you want to delete your feed?
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
								onClick={() => onNavigateFeedEdit() }
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
export default DashboardFeedDeleteApp;


