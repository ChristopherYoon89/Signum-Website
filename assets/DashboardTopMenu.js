import React, { useState, useEffect } from 'react';
import { 
	Layout,
	Space,
	Card,
	Tooltip,
	Avatar,
	Badge,
	Image,
 } from 'antd';
import { 
	ToolOutlined,
	SearchOutlined,
	PlusOutlined,
	CloudDownloadOutlined,
	SettingOutlined,
	ControlOutlined,
	FileAddOutlined,
	StarOutlined,
	PlusCircleFilled,
	PlusCircleTwoTone,
  } from '@ant-design/icons';
import 'antd/dist/antd.min.css';
import { useNavigate } from 'react-router-dom';



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


const ButtonsMainMenu = ({ navigate }) => {
	return (
		<>
			<div className="dashboard-actions">
				<Tooltip
					title={"Add feed"}
					placement="bottom"
					>	
				<span
				onClick={() => navigate(`/dashboard/briefing/addfeed`)}
				>
					<Badge
						offset={[-2, 20]}
						count={
							<PlusCircleTwoTone 
								style={{
									color: '#000000',
									cursor: 'pointer',
								}}
							/>
						}
					>
					<Avatar shape="circle" size={25} icon={<ControlOutlined style={{
						fontSize: 16,
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						height: "100%",
					}}/>} 
						style={{ backgroundColor: "#5b15ffff", verticalAlign: 'left', cursor: "pointer", }} 
						/>
				</Badge>
				</span>
				</Tooltip>
				
				<Tooltip
					title={"Add bookmark feed"}
					placement="bottom"
					>	
				<span 
				onClick={() => navigate(`/dashboard/bookmarks/addfeed`)}
				>
					<Badge
						offset={[-2, 20]}
						count={
							<PlusCircleTwoTone 
								style={{
									color: '#000000',
									cursor: 'pointer', 
								}}
							/>
						}
					>
					<Avatar shape="circle" size={25} icon={<StarOutlined style={{
						fontSize: 16,
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						height: "100%",
					}}/>}
						style={{ backgroundColor: "#5b15ffff", 
							verticalAlign: 'left', 
							cursor: "pointer", 
							display: "flex",
							alignItems: 'center',
							justifyContent: 'center',	
						}} 
						/>
					</Badge>
				</span>
				</Tooltip> 

				<Tooltip
					title={"Settings"}
					placement="bottom"
					>	
				<span
				onClick={() => navigate(`/dashboard/${encodeURIComponent("settings")}`)}
				>
				<Avatar shape="circle" size={25} icon={<SettingOutlined style={{
						fontSize: 16,
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						height: "100%",
					}}/>} 
					style={{ backgroundColor: "#5b15ffff", verticalAlign: 'left', cursor: "pointer", }} 
					/>
				</span>
				</Tooltip>
				
				<Tooltip
					title={"Export data"}
					placement="bottom"
				>	
				<span
				onClick={() => navigate(`/dashboard/${encodeURIComponent("export")}`)}
				>
				<Avatar shape="circle" size={25} icon={<CloudDownloadOutlined style={{
						fontSize: 16,
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						height: "100%",
					}}/>} 
					style={{ backgroundColor: "#5b15ffff", verticalAlign: 'left', cursor: "pointer", }} 
					/>
				</span>
				</Tooltip>
				
				<Tooltip
					title={"Search"}
					placement={"bottom"}
				>
				<span
				onClick={() => navigate(`/dashboard/${encodeURIComponent("search")}`)}
				>
				<Avatar shape="circle" size={25} icon={<SearchOutlined style={{
						fontSize: 16,
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						height: "100%",
					}}/>} 
					style={{ backgroundColor: "#5b15ffff", verticalAlign: 'center', cursor: "pointer", }} 
					/>
				</span>
				</Tooltip>		
				</div>
		</>
	);
};


const ButtonsAPI = ({ navigate }) => {
	return (
		<>
		<div className="dashboard-actions">
			<Tooltip
				title={"Add key"}
				placement="bottom"
				>	
			<span
			onClick={() => navigate(`/dashboard/api`)}
			>
				<Avatar shape="circle" size={25} icon={<PlusOutlined style={{
					fontSize: 16,
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					height: "100%",
				}}/>} 
					style={{ backgroundColor: "#5b15ffff", verticalAlign: 'left', cursor: "pointer", }} 
					/>
			</span>
			</Tooltip>

			<Tooltip
				title={"Edit key"}
				placement="bottom"
				>	
			<span 
			onClick={() => navigate(`/dashboard/api/edit `)}
			>
				<Avatar shape="circle" size={25} icon={<ToolOutlined style={{
					fontSize: 16,
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					height: "100%",
				}}/>} 
					style={{ backgroundColor: "#5b15ffff", verticalAlign: 'left', cursor: "pointer", }} 
					/>
			</span>
			</Tooltip>
			</div>
		</>
	);
};


const DashboardTopMenu = ({title}) => {
	let navigate = useNavigate();

	return (
		<>
			<Space direction="vertical" style={{ display: 'flex' }}>
					<Card className='dashboard-submenu' size="small" bordered={false}>	
						<span className="dashboard-label"> 
							{title}
						</span>

						{((title === "Add API Key") || (title === "Edit API Key")) ? (
							<>
								<ButtonsAPI 
									navigate={navigate}
								/>
							</>
						) : (
							<>
								<ButtonsMainMenu  
									navigate={navigate}
								/>	
							</>
						)
						}
  								
					</Card>
				</Space>
		</>
	)
};
export default DashboardTopMenu;
