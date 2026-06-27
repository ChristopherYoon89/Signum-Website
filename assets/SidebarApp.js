import React from 'react';
import {
	Avatar,
 } from 'antd';
import { 
	StarOutlined,
	AppstoreAddOutlined,
	NotificationOutlined,
	HomeOutlined,
	UserOutlined,
	ReadOutlined,
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useAuth } from "./AuthProvider.js";
import { getCookie } from './ManagerUtility.js';


var csrftoken = getCookie('csrftoken');


const SidebarApp = () => {
	const { isauthenticated, user } = useAuth();
	const profileImage = user?.profile_image_url;

	const handleAuthClick = async () => {
		if (isauthenticated) {
			await fetch(window.DJANGO_URLS.logout, {
				method: "POST",
				headers: {
					"X-CSRFToken": csrftoken,
				},
				credentials: "include",
			});
			window.location.href = window.DJANGO_URLS.logoutjs;
		} else {
			window.location.href = window.DJANGO_URLS.login;
		}
	};

	return (
		<>
			<div className="right-vertical-navigation">
				<div
					className="navigation-item"
					onClick={() => handleAuthClick()}
				>
					<Avatar src={profileImage || undefined} icon={!profileImage && <UserOutlined style={{
						fontSize: 18,
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						height: "100%",
						
					}}/>} />
					<span>{isauthenticated ? "Logout" : "Login"}</span>
				</div>
				
				<Link to={"/dashboard/briefing?scrollToTop=true"}>
				<div className="navigation-item">
					<AppstoreAddOutlined className="navigation-item-icon" />
					<span class="side-nav-text">Briefing</span>
				</div>
				</Link>
				
				<Link to={"/dashboard/bookmarks/?scrollToTop=true"}>
				<div className="navigation-item">
				<StarOutlined className="navigation-item-icon" />
				<span>Bookmarks</span>
				</div>
				</Link>
				
				<Link to={"/dashboard/category/All-Articles?scrollToTop=true"}>
				<div className="navigation-item">
				<ReadOutlined className="navigation-item-icon" />
				<span class="side-nav-text">Articles</span>
				</div>
				</Link>
				
				<Link to={"/dashboard/mysources/?scrollToTop=true"}>
				<div className="navigation-item">
				<NotificationOutlined className="navigation-item-icon" />
				<span>My Sources</span>
				</div>
				</Link>
				
				<Link to={'/?scrollToTop=true'}>
				<div className="navigation-item">
				<HomeOutlined className="navigation-item-icon" />
				<span class="side-nav-text">Home</span>
				</div>
				</Link>

			</div>
		</>
	);
};
export default SidebarApp; 