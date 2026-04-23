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


const SelectDataModels = ({ selectexportmodel, onChangeSelectExportModel }) => {
	return(
		<>
			<div className="sig-form-header">
				Select feed
				<span>
					<Tooltip
						placement='right'
						title='Select the database model that should be exported'
					>
					<QuestionCircleOutlined className="sig-form-info-icon"/>
					</Tooltip>
				</span> 
			</div>
			<div className='sig-form-input'>
				<Select
					className='sig-form-select'
					style={{ width: 400, }}
					value={selectexportmodel}
					placeholder="Please select"
					onChange={onChangeSelectExportModel}
					options={[
						{
							value: 'briefing_feeds', 
							label: 'Briefing feeds',
						},
						{
							value: 'bookmark_feeds',
							label: 'Bookmark feeds',
						},
					]}
				/>
			</div>
		</>
	);
};


const SelectFileFormat = ({ selectfileformat, onChangeSelectFileFormat }) => {
	return (
		<>
			<div className="sig-form-header">
				Select file format
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
					placeholder="Please select"
					value={selectfileformat}
					style={{ width: 400, }}
					onChange={onChangeSelectFileFormat}
					options={[
						{
							value: 'csv',
							label: 'CSV',
						},
						{
							value: 'json',
							label: 'JSON',
						},
					]}
				/>
			</div>
		</>
	);
};




const SelectLimit = ({ selectlimit, onChangeSelectLimit }) => {
	return (
		<>
			<div className="sig-form-header">
				Select number of articles per feed
				<span>
					<Tooltip
						placement='right'
						title='Specify how many articles per feed should be exported. You can export a maximum number of 1,000 articles'
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
					placeholder="Please select"
					value={selectlimit}
					style={{ width: 400, }}
					onChange={onChangeSelectLimit}
					options={[
						{
							value: 20,
							label: '20',
						},
						{
							value: 50,
							label: '50',
						},
						{
							value: 100,
							label: '100',
						},
					]}
				/>
			</div>
		</>
	);
};


const DashboardExportDataApp = () => {
	const { isauthenticated, user } = useAuth();
	const [selectexportmodel, setSelectExportModel] = useState([]);
	const [selectfileformat, setSelectFileFormat] = useState([]);
	const [selectlimit, setSelectLimit] = useState();
	
	const [showalert, setShowAlert] = useState(false);
	const [alertmessage, setAlertMessage] = useState('');
	const [alerttype, setAlertType] = useState('');
	const [alertdescription, setAlertDescription] = useState('');


	const onChangeSelectExportModel = (value) => {
		setSelectExportModel(value);
	};


	const onChangeSelectFileFormat = (value) => {
		setSelectFileFormat(value);
	};


	const onChangeSelectLimit = (value) => {
		setSelectLimit(value);
	}


	const onShowAlert = (message, description, type, show) => {
		setAlertMessage(message);
		setAlertDescription(description);
		setAlertType(type)
		setShowAlert(show);
	};


	const handleClearFields = () => {
		setSelectExportModel([]);
		setSelectFileFormat([]);
	};


	const checkFilterFeedApplied = () => {
		return (
			selectexportmodel.length > 0
		);
	};
	
	
	const checkFilterFileTypeApplied = () => {
		return (
			selectfileformat.length > 0 
		);
	};


	const onExportData = async () => {
		if (!isauthenticated) return;

		const isFilterFeedApplied = checkFilterFeedApplied();

		if (!isFilterFeedApplied) {
			window.scrollTo({top: 0,behavior: "smooth"});
			onShowAlert('Error', 'Please select data model you want to export', 'error', true);
			return;
		};

		const isFilterFileFormatApplied = checkFilterFileTypeApplied();

		if (!isFilterFileFormatApplied) {
			window.scrollTo({top: 0,behavior: "smooth"});
			onShowAlert('Error', 'Please select a file format', 'error', true);
			return;
		};

		if (isFilterFeedApplied && isFilterFileFormatApplied) {
			onShowAlert('', '', 'success', false);
		};
		
		try {
			const response = await axios.post(`/api/export-data/`, {
				selectedfeed: selectexportmodel,
				fileformat: selectfileformat,
				selectlimit: selectlimit,
			},
			{	
				responseType: "blob",
				withCredentials: true,
				headers: {
					'X-CSRFToken': csrftoken,
				}
			});
			
				const blob = new Blob([response.data]);
				const link = document.createElement("a");

				let filename = `${user.username}_${selectexportmodel}.${selectfileformat}`

				link.href = window.URL.createObjectURL(blob);
				link.download = filename;
				link.click()
				window.scrollTo({top: 0,behavior: "smooth"});
				onShowAlert('Success', 'Your download started. Check your Downloads folder', 'success', true);
				handleClearFields();
			
		} catch(error) {
			window.scrollTo({top: 0,behavior: "smooth"});
			console.error('Failed to save feed');
			onShowAlert('Error', 'Failed to download data. Please try again later!', 'error', true);
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
						<SelectDataModels
							selectexportmodel={selectexportmodel}
							onChangeSelectExportModel={onChangeSelectExportModel}
						/>
					</Col>
					<Col span={12}>
						<SelectFileFormat  
							selectfileformat={selectfileformat}
							onChangeSelectFileFormat={onChangeSelectFileFormat}
						/>
					</Col>
				</Row>

				<Divider />

				<Row>
					<Col span={12}>
						<SelectLimit 
							selectlimit={selectlimit}
							onChangeSelectLimit={onChangeSelectLimit} 
						/>
					</Col>
				</Row>

					<Row style={{ marginTop: 25, }}>
						<Col span={12}>
							<Button 
								type='primary'
								onClick={onExportData}
							>
							Export data
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
export default DashboardExportDataApp;


