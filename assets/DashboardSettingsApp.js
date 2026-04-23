import React, { useState, useEffect } from 'react';
import {
	Row,
	Col,
	Card,
	Button,
	Checkbox,
	Select,
	Tooltip,
	Divider,
	List,
	Alert,
  } from 'antd';
import {
	QuestionCircleOutlined,
	CaretUpOutlined,
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


const SettingsApp = () => {
	const [allfeeds, setAllFeeds] = useState([]);
	const [allbookmarkfeeds, setAllBookmarkFeeds] = useState([]);
	const [displayedfeeds, setDisplayedFeeds] = useState([]);
	const [displayedbookmarkfeeds, setDisplayedBookmarkFeeds] = useState([]);
	const [showarticletags, setShowArticleTags] = useState();
	const [showarticletimestamp, setShowArticleTimestamp] = useState();
	const [localFeeds, setLocalFeeds] = useState([]);
	const [localbookmarkFeeds, setLocalBookmarkFeeds] = useState([]);

	const [showalert, setShowAlert] = useState(false);
	const [alertmessage, setAlertMessage] = useState('');
	const [alerttype, setAlertType] = useState('');
	const [alertdescription, setAlertDescription] = useState('');

	const { isauthenticated, user, usersettings, setUserSettings } = useAuth();


	useEffect(() => {
		setShowArticleTags(usersettings.show_article_tags);
	}, [usersettings]);


	useEffect(() => {
		setShowArticleTimestamp(usersettings.show_article_timestamp); 
	}, [usersettings]);


	useEffect(() => {
		const fetchAllFeeds = async () => {
			try {
				const response = await axios.get(`/api/FeedsAllSettings`);
				const feeds = response.data
					.map((row) => ({
						value: row.id,
						label: row.title,
						publish_boolean: row.publish_boolean,
						ranking: row.ranking,
					}))
					.sort((a, b) => a.ranking - b.ranking);

				setLocalFeeds(feeds);
				setAllFeeds(feeds);

				const selectedFeeds = feeds
					.filter((feed) => feed.publish_boolean)
					.map((feed) => ({
						value: feed.value,
						label: feed.label,
					}));
				setDisplayedFeeds(selectedFeeds);
			} catch (error) {
				console.error("Failed to fetch user feeds");
			}
		};

		fetchAllFeeds();
	}, []);


	useEffect(() => {
		const fetchAllBookmarkFeeds = async () => {
			try {
				const response = await axios.get(`/api/BookmarkFeedsAllSettings`);
				const feeds = response.data
					.map((row) => ({
						value: row.id,
						label: row.title,
						publish_boolean: row.publish_boolean,
						ranking: row.ranking,
					}))
					.sort((a, b) => a.ranking - b.ranking);

				setLocalBookmarkFeeds(feeds);
				setAllBookmarkFeeds(feeds);

				const selectedFeeds = feeds
					.filter((feed) => feed.publish_boolean)
					.map((feed) => ({
						value: feed.value,
						label: feed.label,
					}));
				setDisplayedBookmarkFeeds(selectedFeeds);
			} catch (error) {
				console.error("Failed to fetch user feeds");
			}
		};

		fetchAllBookmarkFeeds();
	}, []);


	const onChangeDisplayFeed = (value) => {
		setDisplayedFeeds(value);
		
		const selectedIds = value.map(v => v.value);

		const updatedFeeds = localFeeds.map(feed => ({...feed, 
			publish_boolean: selectedIds.includes(feed.value)
		}));

		setLocalFeeds(updatedFeeds);
	};


	const onChangeDisplayBookmarkFeed = (value) => {
		setDisplayedBookmarkFeeds(value);
		
		const selectedIds = value.map(v => v.value);

		const updatedFeeds = localbookmarkFeeds.map(feed => ({...feed, 
			publish_boolean: selectedIds.includes(feed.value)
		}));

		setLocalBookmarkFeeds(updatedFeeds);
	};


	const onChangeShowTags = () => {
		setShowArticleTags(!showarticletags);
	};


	const onChangeShowTimestamp = () => {
		setShowArticleTimestamp(!showarticletimestamp);
	};


	const normalizeRanking = (feeds) => {
		return feeds.map((feed, index) => ({
			...feed,
			ranking: index + 1
		}));
	};


	const moveFeed = (index, direction) => {
		const newIndex = index + direction;
		if (newIndex < 0 || newIndex >= localFeeds.length) return;
		const newFeeds = [...localFeeds];
		[newFeeds[index], newFeeds[newIndex]] = [newFeeds[newIndex], newFeeds[index]];
		setLocalFeeds(normalizeRanking(newFeeds));
	};


	const moveBookmarkFeed = (index, direction) => {
		const newIndex = index + direction;
		if (newIndex < 0 || newIndex >= localbookmarkFeeds.length) return;
		const newFeeds = [...localbookmarkFeeds];
		[newFeeds[index], newFeeds[newIndex]] = [newFeeds[newIndex], newFeeds[index]];
		setLocalBookmarkFeeds(normalizeRanking(newFeeds));
	};


	const onSaveChanges = async () => {
		if (!isauthenticated) return;

		try {
			const response = await axios.post("/api/update-user-settings/", {
				show_article_tags: showarticletags,
				show_article_timestamp: showarticletimestamp,
				displayed_feeds: displayedfeeds.map(feed => feed.value),
				ranked_feeds: localFeeds,
				displayed_bookmark_feeds: displayedbookmarkfeeds.map(feed => feed.value),
				ranked_bookmarked_feeds: localbookmarkFeeds,
			}, 
			{	
				withCredentials: true,
				headers: {
					'X-CSRFToken': csrftoken,
				}
			});

			if (response.status === 200) {
				window.scrollTo({top: 0,behavior: "smooth"});
				setAlertType("success");
				setAlertMessage("Success");
				setAlertDescription("Settings successfully updated");
				setShowAlert(true);
				}
				setUserSettings(prev => ({
					...prev,
					show_article_tags: showarticletags,
      	}));
				setUserSettings(prev => ({
					...prev,
					show_article_timestamp: showarticletimestamp
      	}));

		} catch (error) {
			window.scrollTo({top: 0,behavior: "smooth"});
			setAlertType("error");
			setAlertMessage("Error");
			setAlertDescription("Update of settings failed");
			setShowAlert(true);
			console.log("Failed to save settings");
		};
	};

	return (
		<>
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
					<Col span={12}>
							<div className="sig-form-header">
								Article info
							</div>
							<div className="sig-form-input">
								<div>
								<Checkbox checked={showarticletags} disabled={false} onChange={onChangeShowTags}>
								Show tags of articles
								</Checkbox>
								<span>
									<Tooltip
										placement='right'
										title='Check this box to enable tags in your briefing'
									>
									<QuestionCircleOutlined 
										className="sig-form-info-icon"
									/>
									</Tooltip>
								</span>
								</div>
								<div style={{ marginTop: 10, }}>
								<Checkbox checked={showarticletimestamp} disabled={false} onChange={onChangeShowTimestamp}>
								Show time stamps of articles
								</Checkbox>
								<span>
									<Tooltip
										placement='right'
										title='Check this box to enable timestamps in your briefing'
									>
									<QuestionCircleOutlined 
										className="sig-form-info-icon"
									/>
									</Tooltip>
								</span>
								</div>
							</div>

						</Col>
					</Row>

					<Divider />

					<Row>
						<Col span={12}>

							<div className="sig-form-header">
								Show briefing feeds 
								<span>
								<Tooltip
									placement='right'
									title='Unselect feeds to hide them from your briefing'
								>
								<QuestionCircleOutlined 
									className="sig-form-info-icon"
								/>
								</Tooltip>
							</span>
							</div>
							<div className='sig-form-input'>
								<Select
									className="sig-form-select"
									mode="multiple"
									allowClear
									style={{
										width: 500,
									}}
									placeholder="Please select"
									onChange={onChangeDisplayFeed}
									options={allfeeds}
									value={displayedfeeds}
									labelInValue
								/>
							</div>

					</Col>

					<Col span={12}>

							<div className="sig-form-header">
								Show bookmark feeds 
								<span>
								<Tooltip
									placement='right'
									title='Unselect bookmark feeds to hide them from your bookmarks board'
								>
								<QuestionCircleOutlined 
									className="sig-form-info-icon"
								/>
								</Tooltip>
							</span>
							</div>
							<div className='sig-form-input'>
								<Select
									className="sig-form-select"
									mode="multiple"
									allowClear
									style={{
										width: 500,
									}}
									placeholder="Please select"
									onChange={onChangeDisplayBookmarkFeed}
									options={allbookmarkfeeds}
									value={displayedbookmarkfeeds}
									labelInValue
								/>
							</div>
						
					</Col>
				</Row>

				<Divider />

				<Row>
					<Col span={12}>
							<div className="sig-form-header">
								Rank briefing feeds
								<span>
								<Tooltip
									placement='right'
									title='Rank feeds to display them in a specific order'
								>
								<QuestionCircleOutlined 
									className="sig-form-info-icon"
								/>
								</Tooltip>
							</span>
							</div>
							<div className='sig-form-input' style={{ width: "90%"}}>
								<List
									dataSource={localFeeds}
									bordered
									renderItem={(feed, index) => (
										<List.Item
											style={{
												opacity: feed.publish_boolean ? 1 : 0.4,
												background: feed.publish_boolean ? "#fff" : "#f5f5f5"
											}}
											actions={[
												<Button
													icon={<CaretUpOutlined className="antd-feed-list-arrow-icon" />}
													onClick={() => moveFeed(index, -1)}
													disabled={index === 0}
													className="antd-feed-list-button"
													size="small"
												/>,
												<Button
													icon={<CaretDownOutlined className="antd-feed-list-arrow-icon" />}
													onClick={() => moveFeed(index, 1)}
													disabled={index === localFeeds.length - 1}
													className="antd-feed-list-button"
													size="small"
												/>
											]}
										>
											<div style={{ display: "flex", gap: 10 }}>
												{feed.ranking}.
												<span>{feed.label}</span>
												{!feed.publish_boolean && (
													<span style={{ color: "#999" }}>
														(hidden)
													</span>
												)}
											</div>
										</List.Item>
									)}
								/>
							</div>
					</Col>

					<Col span={12}>
						<div className="sig-form-header">
							Rank bookmark feeds
							<span>
							<Tooltip
								placement='right'
								title='Rank feeds to display them in a specific order'
							>
							<QuestionCircleOutlined 
								className="sig-form-info-icon"
							/>
							</Tooltip>
						</span>
						</div>
						<div className='sig-form-input' style={{ width: "90%"}}>
							<List
								dataSource={localbookmarkFeeds}
								bordered
								renderItem={(feed, index) => (
									<List.Item
										style={{
											opacity: feed.publish_boolean ? 1 : 0.4,
											background: feed.publish_boolean ? "#fff" : "#f5f5f5"
										}}
										actions={[
											<Button
												icon={<CaretUpOutlined className="antd-feed-list-arrow-icon" />}
												onClick={() => moveBookmarkFeed(index, -1)}
												disabled={index === 0}
												className="antd-feed-list-button"
												size="small"
											/>,
											<Button
												icon={<CaretDownOutlined className="antd-feed-list-arrow-icon" />}
												onClick={() => moveBookmarkFeed(index, 1)}
												disabled={index === localbookmarkFeeds.length - 1}
												className="antd-feed-list-button"
												size="small"
											/>
										]}
									>
										<div style={{ display: "flex", gap: 10 }}>
											{feed.ranking}.
											<span>{feed.label}</span>
											{!feed.publish_boolean && (
												<span style={{ color: "#999" }}>
													(hidden)
												</span>
											)}
										</div>
									</List.Item>
								)}
							/>
						</div>
					</Col>
				</Row>
				
				<Divider />

				<Row>
					<Col span={24}>
						<Button 
							type="primary"
							style={{ marginTop: 25, }}
							onClick={onSaveChanges}
							>
							Save Changes
						</Button>
					</Col>
				</Row>
			</Card>
		</>
	);
};
export default SettingsApp;


