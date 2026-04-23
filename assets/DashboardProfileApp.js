import React, { useState, useEffect } from 'react';
import {
	Layout,
	Divider,
	Row,
	Col,
	Card,
	Avatar,
	Button,
	Upload,
	Input,
	Tooltip,
	Alert,
  } from 'antd';
import {
	UploadOutlined,
	QuestionCircleOutlined,
	CaretRightOutlined,
	CaretDownOutlined,
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


const CompUploadImage = ({ onChangeProfilePic, profileImage }) => {
	return (
		<>
			<div className="sig-form-header">
			Profile image
			</div>

			<div style={{ marginTop: 15, }}>
			<Avatar src={profileImage} size={65} alt={"profile image"} />
			<span style={{ marginLeft: 20, }}>				
				<Upload 
					maxCount={1}
					showUploadList={false}
					onChange={onChangeProfilePic}
				>
				<Button icon={<UploadOutlined style={{ display: 'inline-flex' }}/>}>Click to Upload</Button>
				</Upload>
			</span>
			</div>
		</>
	);
};


const CompInputUserName = ({ username, onChangeInputUserName, }) => {
	return(
		<>
			<div className="sig-form-header">
				Username*
			</div>
			<div className="sig-form-input">
				<Input
					style={{ width: 400, }}
					value={username}
					onChange={(e) => onChangeInputUserName(e.target.value)}
				/>
			</div>
		</>
	);
};


const CompUserInfoPassword = ({ passworduserupdate, onChangeUserInfoPassword }) => {
	return(
		<>
			<div className="sig-form-header" style={{ marginTop: 25, }}>
				Password*
				<span>
					<Tooltip
						placement='top'
						title='Please provide your password for confirmation'
					>
					<QuestionCircleOutlined className="sig-form-info-icon"	/>
					</Tooltip>
				</span>
			</div>

			<div className="sig-form-input">
				<Input.Password
					placeholder="Your password" 
					style={{ width: 400, }}
					value={passworduserupdate}
					onChange={onChangeUserInfoPassword}
				/>
			</div>
		</>
	);
};


const CompInputEmail = ({ email, onChangeInputEmail }) => {
	return (
		<>
			<div className="sig-form-header">
			Email*
			</div>
			<div className='sig-form-input'>
				<Input
					className="sig-form-input"
					style={{ width: 400 }}
					value={email}
					onChange={(e) => onChangeInputEmail(e.target.value)}
				/>
			</div>
		</>
	);
};


const CompMore = ({ 
				ispasswordcontainervisible, 
				onClickShowPassword, 
				onChangeInputOldPassword, 
				onChangeInputNewPassword,
				onChangeUserPassword,
				onClickShowDeleteAccount,
				isdeleteaccountvisible,
				onClickDonateBitcoin,
				onDownloadUserData,
				onChangeInputPasswordDeleteAccount,
				onChangeDeactivateAccount,
				newpassword,
				oldpassword,
				passworddelete,
			}) => {
	return(
		<>
			<div className="sig-form-header">
			More
			</div>

			<div className="sig-form-input">
			<span 
				className="profile-more"
				onClick={onClickShowPassword}
			>
			{ispasswordcontainervisible ? (
				<>
				<CaretDownOutlined />
				</>
			) : (
				<>
				<CaretRightOutlined />
				</>
			)
			}	
			Change password
			</span>

			{ ispasswordcontainervisible && (
			<>
			<Divider />	
			<Row>
				<Col span={12}>
					<div className="sig-form-header">
						Current password
						<span>
							<Tooltip
								placement='right'
								title='Please enter your current password'
							>
							<QuestionCircleOutlined className="sig-form-info-icon"	/>
							</Tooltip>
						</span>
					</div>
					<div className="sig-form-input">
						<Input.Password
							placeholder="Current password"
							style={{	width: 400,	}}
							value={oldpassword}
							onChange={onChangeInputOldPassword}
						/>
					</div>
				</Col>
				<Col span={12}>
					<>
						<div className="sig-form-header">
							New password
							<span>
								<Tooltip
									placement='right'
									title='Your password cannot be too similar to your other personal information.
												Your password must contain at least 8 characters.
												Your password cannot be a commonly used password.
												Your password cannot be entirely numeric.'
								>
								<QuestionCircleOutlined className="sig-form-info-icon"	/>
								</Tooltip>
							</span>
						</div>
						<div className="sig-form-input">
							<Input.Password
								placeholder="New password" 
								style={{ width: 400, }}
								value={newpassword}
								onChange={onChangeInputNewPassword}
							/>
						</div>
					</>
				</Col>
				<Button 
					type="primary"
					style={{ marginTop: 35, }}
					onClick={onChangeUserPassword}
				>
				Save Password
				</Button> 
			</Row>
			
			<Divider />
			</>
			) 
			}				
			</div>

			<div className="sig-form-input">	
				<span 
					className="profile-more"
					onClick={onDownloadUserData}
				>
				<CaretRightOutlined />
				Download your personal data
				</span> 
			</div>

			<div className="sig-form-input">
				<span 
					className="profile-more"
					onClick={onClickDonateBitcoin}
				>
				<CaretRightOutlined />
				Donate in Bitcoin
				</span>
			</div>

			<div className="sig-form-input">
			<span 
				className="profile-more"
				onClick={onClickShowDeleteAccount}
			>
			{isdeleteaccountvisible ? (
				<>
				<CaretDownOutlined />
				</>
			) : (
				<>
				<CaretRightOutlined />
				</>
			)
			}
			Delete your account
			</span>
			{ isdeleteaccountvisible && (
				<>
				<Divider />
				<Row>
					<Col span={24}>
						<div className="sig-form-header">
							Are you really sure that you want to delete your account?
						</div>
						<div className="sig-form-input">	
							<span className="profile-more">
							Enter your password to confirm. Please note that we keep your data stored for up to six months due to regulatory reasons. 
							</span> 
						</div>

						<div className="sig-form-input" style={{ marginTop: 25, }}>
							<Input.Password
								placeholder="Your password" 
								style={{ width: 400, }}
								value={passworddelete}
								onChange={onChangeInputPasswordDeleteAccount}
							/>
						</div>

					</Col>
					<Button 
						type="primary"
						onClick={onChangeDeactivateAccount}
						style={{ marginTop: 35, }}
					>
					Delete Account
					</Button>
				</Row>
				<Divider />
				</>
			)
			}
			</div>
		</>
	);
};


const DashboardProfileApp = () => {
	const { isauthenticated, user } = useAuth();
	const [username, setUsername] = useState(user.username);
	const [profileimageurl, setProfileImageUrl] = useState(user.profile_image_url);
	const [email, setEmail] = useState(user.email);
	const [newpassword, setNewPassword] = useState('');
	const [oldpassword, setOldPassword] = useState('');
	const [passworddelete, setPasswordDelete] = useState('');
	const [passworduserupdate, setPasswordUserUpdate] = useState('');

	const [ispasswordcontainervisible, setIsPasswordContainerVisible] = useState(false);
	const [isdeleteaccountvisible, setIsDeleteAccountVisible] = useState(false);

	const [showalert, setShowAlert] = useState(false);
	const [alertmessage, setAlertMessage] = useState('');
	const [alerttype, setAlertType] = useState('');
	const [alertdescription, setAlertDescription] = useState('');


	const onChangeInputUserName = (input) => {
		setUsername(input);
	}; 


	const onChangeInputEmail = (input) => {
		setEmail(input);
	};


	const onChangeUserInfoPassword = (e) => {
		setPasswordUserUpdate(e.target.value);
	};

	const onChangeInputOldPassword = (e) => {
		setOldPassword(e.target.value);
	};


	const onChangeInputNewPassword = (e) => {
		setNewPassword(e.target.value);
	};


	const onClickShowPassword = () => {
		setIsPasswordContainerVisible(!ispasswordcontainervisible);
	};


	const onClickShowDeleteAccount = () => {
		setIsDeleteAccountVisible(!isdeleteaccountvisible);
	};


	const onChangeInputPasswordDeleteAccount = (e) => {
		setPasswordDelete(e.target.value);
	};


	const onClickDonateBitcoin = () => {
		window.location.href = window.DJANGO_URLS.donate;
	};


	const onShowAlert = (message, description, type, show) => {
		setAlertMessage(message);
		setAlertDescription(description);
		setAlertType(type)
		setShowAlert(show);
	};


	const isValidEmail = (email) => {
		return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
	};


	const isPasswordValid = (password) => {
		if (!password) return false;
		if (password.length < 8) return false;
		if (/^\d+$/.test(password)) return false;
		return true;
	};


	const onChangeUserPassword = async (e) => {
		if (!isauthenticated) return; 

		e.preventDefault();
		onShowAlert('', '', '', false);

		const isnewpasswordvalid = isPasswordValid(newpassword);

		if (!isnewpasswordvalid) {
			window.scrollTo({top: 0,behavior: "smooth"});
			onShowAlert("Error", "Provide a valid password", "error", true);
			return;
		};

		try {
			const response = await axios.patch(`/api/update-password/`,
				{
					oldpassword: oldpassword,
					newpassword: newpassword,
				},
				{
					withCredentials: true,
					headers: { "X-CSRFToken": csrftoken },
				}
			);
			if (response.status === 200) {
				window.scrollTo({top: 0, behavior: 'smooth'});
				setOldPassword('');
				setNewPassword('');
				onShowAlert("Success", "Password successfully updated", "success", true);
			};
		} catch (e) {
			console.error(e);
			if (e.response?.data?.error) {
				window.scrollTo({top: 0, behavior: 'smooth'});
      	onShowAlert("Error", `${e.response.data.error}`, "error", true);
				setOldPassword('');
				setNewPassword('');
			};
		};
	};


	const onChangeProfilePic = async (info) => {
		if (!isauthenticated) return;

		const { file } = info;

		if (file.status === 'uploading') return;

		const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/bmp'];
		const isValidType = allowedTypes.includes(file.type);

		if (!isValidType) {
			onShowAlert('Error', `${file.name} is not a valid image file.`, 'error', true);
			return;
		}

		const formData = new FormData();
		formData.append('image', file.originFileObj);

		try {
			const response = await axios.post(
				'/api/update-profile-image/',
				formData,
				{
					withCredentials: true,
					headers: {
						'X-CSRFToken': csrftoken,
					},
				}
			);
			if (response.status === 200) {
			setProfileImageUrl(response.data.image_url);
			onShowAlert('Success', 'Profile image successfully updated', 'success', true);
			}
		} catch (error) {
			onShowAlert('Error', 'Profile image update failed', 'error', true);
		}
	};


	const UpdateUserData = async (event) => {
		if (!isauthenticated) return;

    const isusernamevalid = username.trim().length > 0;
		const isemailvalid = isValidEmail(email);

		if (!isusernamevalid) {
			window.scrollTo({top: 0,behavior: "smooth"});
			onShowAlert("Error", "Provide a valid username", "error", true);
			return;
		};

		if (!isemailvalid) {
			window.scrollTo({top: 0, behavior: "smooth"});
			onShowAlert("Error", "Provide a valid email", "error", true);
			return;
		};

		if (!passworduserupdate || passworduserupdate.length === 0) {
			onShowAlert("Error", "Please confirm with your password", "error", true);
			return;
		};

		if (isusernamevalid && isemailvalid) {
			onShowAlert('', '', '', false);
		};

    try{
      const response = await axios.patch(`/api/update-userinfo/`, 
			{
				username: String(username),
				email: String(email),
				password: passworduserupdate,
			},
			{
				withCredentials: true,
				headers: { "X-CSRFToken": csrftoken },
			}
			);

      if (response.status === 200) {
				window.scrollTo({top: 0, behavior: 'smooth'});
				setPasswordUserUpdate('');
				onShowAlert("Success", "User data successfully updated", "success", true);
      };
			
    } catch (e) {
			console.error(e);
			if (e.response?.data?.error) {
				window.scrollTo({top: 0, behavior: 'smooth'});
				setPasswordUserUpdate('');
      	onShowAlert("Error", `${e.response.data.error}`, "error", true);
			};
    };
  };


	const onDownloadUserData = async () => {
		if (!isauthenticated) return;

		try {
			const response = await axios.get(`/api/download-user-data/`,
				{
					responseType: "blob",
					withCredentials: true,
					headers: { 'X-CSRFToken': csrftoken },
				}
			);
			if (response.status === 200) {
				const blob = new Blob([response.data], { type: "application/zip" });
				const url = window.URL.createObjectURL(blob);

				const link = document.createElement("a");
				link.href = url;
				link.download = "user_data.zip";

				document.body.appendChild(link);
				link.click();

				link.remove();
				window.URL.revokeObjectURL(url);

				window.scrollTo({top: 0, behavior: 'smooth'});
				onShowAlert('Success', 'User data successfully downloaded', 'success', true);
			}
		} catch (e) {
			if (e.response?.data?.error) {
				window.scrollTo({top: 0, behavior: 'smooth'});
      	onShowAlert("Error", `${e.response.data.error}`, "error", true);
			};
		};
	};


	const onChangeDeactivateAccount = async () => {
		if (!isauthenticated) return;

		try {
			const response = await axios.post(`/api/deactivate-user/`,
				{ 
					password: passworddelete,
				},
				{
					withCredentials: true,
					headers: { "X-CSRFToken": csrftoken },
				}
			);
			if (response.status === 200) {
				window.scrollTo({top: 0, behavior: 'smooth'});
				window.location.href = window.DJANGO_URLS.startpage
			}
		} catch (e) {
			const message =
				e.response?.data?.error ||
				"Failed to deactivate account";
			window.scrollTo({top: 0, behavior: 'smooth'});
			onShowAlert("Error", `${message}`, "error", true);
			setPasswordDelete('');
		};
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
					<Col span={22}>
						<CompUploadImage
							profileImage={profileimageurl} 
							onChangeProfilePic={onChangeProfilePic}
						/>
					</Col>
				</Row>

				<Divider />

				<Row>
					<Col span={12}>

						<CompInputUserName 
							username={username}
							onChangeInputUserName={onChangeInputUserName}
						/>

					</Col>
					<Col span={12}>
						<CompInputEmail 
							email={email}
							onChangeInputEmail={onChangeInputEmail}
						/>
					</Col>
				</Row>

				<Row>
					<Col span={12}>
						<CompUserInfoPassword 
							onChangeUserInfoPassword={onChangeUserInfoPassword}
							passworduserupdate={passworduserupdate}
						/>
					</Col>
				</Row>
				
				<Row style={{ marginTop: 35, }}>
					<Col span={12}>
						<Button 
							type="primary"
							onClick={UpdateUserData}
						>
						Save Changes
						</Button>
					</Col>		
				</Row>

				<Divider />

				<Row style={{ marginTop: 35, }}>
					<Col span={24}>
						<CompMore 
							ispasswordcontainervisible={ispasswordcontainervisible}
							onClickShowPassword={onClickShowPassword}
							onChangeInputOldPassword={onChangeInputOldPassword}
							onChangeInputNewPassword={onChangeInputNewPassword}
							newpassword={newpassword}
							oldpassword={oldpassword}
							onChangeUserPassword={onChangeUserPassword}
							onClickShowDeleteAccount={onClickShowDeleteAccount}
							isdeleteaccountvisible={isdeleteaccountvisible}
							onClickDonateBitcoin={onClickDonateBitcoin}
							onDownloadUserData={onDownloadUserData}
							onChangeInputPasswordDeleteAccount={onChangeInputPasswordDeleteAccount}
							onChangeDeactivateAccount={onChangeDeactivateAccount}
							passworddelete={passworddelete}
						/>
					</Col>	
				</Row>				
				</Card>
			</Layout>
		</>
	);
};
export default DashboardProfileApp;


