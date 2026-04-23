import React, {useState, useEffect} from 'react';
import {
	Avatar,
 } from 'antd';
import { 
	StarOutlined,
	SettingOutlined,
	AppstoreAddOutlined,
	BellOutlined,
	EditOutlined,
	NotificationOutlined,
	HomeOutlined,
	UserOutlined,
	ReadOutlined,
} from '@ant-design/icons';
import Axios from "axios";
import axios from 'axios';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';
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



const SidebarApp = () => {
	const { isauthenticated, user } = useAuth();
	const profileImage = user?.profile_image_url;

	const navigate = useNavigate();

	const handleClick = (route) => {
		navigate(route);
  };


	const handleDashboardClick = () => {
		if (!isauthenticated) {
			window.location.href = window.DJANGO_URLS.login;
			return; 
		}
		navigate("/?scrollToTop=true")
	};


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

				<div
					className="navigation-item"
					onClick={() => handleClick('/?scrollToTop=true')}
				>
					<HomeOutlined className="navigation-item-icon" />
					<span class="side-nav-text">Home</span>
				</div>

				<div
					className="navigation-item"
					onClick={() => handleClick("/dashboard/briefing?scrollToTop=true")}
				>
					<AppstoreAddOutlined className="navigation-item-icon" />
					<span class="side-nav-text">Briefing</span>
				</div>

				<div
					className="navigation-item"
					onClick={() => handleClick("/dashboard/category/All-Articles?scrollToTop=true")}
				>
					<ReadOutlined className="navigation-item-icon" />
					<span class="side-nav-text">Articles</span>
				</div>

				<div
					className="navigation-item"
					onClick={() => handleClick("/dashboard/bookmarks/?scrollToTop=true")}
				>
					<StarOutlined className="navigation-item-icon" />
					<span>Bookmarks</span>
				</div>

				<div
					className="navigation-item"
					onClick={() => handleClick("/dashboard/mysources/?scrollToTop=true")}
				>
					<NotificationOutlined className="navigation-item-icon" />
					<span>MySources</span>
				</div>

			</div>
		</>
	);
};
export default SidebarApp; 