import React, {useState, useEffect} from 'react';
import { 
	Layout,
	Card,
	Tooltip,
	Table,
	Tag,
	Rate,
	Popover,
	Button,
 } from 'antd';
import { 
SyncOutlined,
StockOutlined,
StarOutlined,
PlusOutlined,
} from '@ant-design/icons';
import Axios from "axios";
import axios from 'axios';
import moment from 'moment';
import PopOverContent from './StatsNewsArticle.js';
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthProvider.js";
import DashboardBookmarkFeedPopover from './DashboardBookmarkFeedPopover.js';


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



const ArticlesSourceApp = () => {
	const [tabledata, setstate] = useState([]);
  const [loading, setloading] = useState(true);
  const [userbookmarks, setUserBookmarks] = useState([]);
	const [userfollows, setUserFollows] = useState([]);
	const { sourceName } = useParams();
	const source = decodeURIComponent(sourceName)
	const navigate = useNavigate();
	const { pathname, search } = useLocation();
  const params = new URLSearchParams(search);
	const { isauthenticated, user } = useAuth();

	const [page, setPage] = useState(1);
	const [hasMore, setHasMore] = useState(true);
	const [loadingMore, setLoadingMore] = useState(false);


  useEffect(() => {
    if (params.get('scrollToTop') === 'true') {
      window.scrollTo(0, 0);
    }
  }, [pathname, search]);



	const getData = async (pageNumber = 1) => {
		try {
				if (pageNumber === 1) {
					setloading(true);
				} else {
					setLoadingMore(true);
				}
			const response = await Axios.get(`/api/NewsSourceSingle/?source=${encodeURIComponent(source)}&page=${pageNumber}`);
			
			const newData = response.data.results.map(row => ({
					id: row.id,
					source: row.source,
					source_id: row.source_id,
					source_name: row.source_name,
					source_url: row.source_url,
					title: row.title,
					date_posted: row.date_posted,
					tag1: row.tag1,
					tag2: row.tag2,
					tag3: row.tag3,
					algo_rating: parseFloat(row.algo_rating),
					average_rating: parseFloat(row.average_rating),
					clicks_count: parseFloat(row.clicks_count), 
					average_sourcerating: parseFloat(row.average_sourcerating),
					average_algo_sourcerating: parseFloat(row.average_algo_sourcerating),
				}));
				if (pageNumber === 1) {
					setstate(newData);
				} else {
					setstate(prev => [...prev, ...newData]);
				}
				setHasMore(response.data.next !== null);
				setPage(pageNumber);
		} catch (error) {
			console.error("Failed to fetch article data");
		} finally {
			setloading(false);
			setLoadingMore(false);
		};
	};


	useEffect(() => {
		if (!isauthenticated) return;

		setPage(1);
		setHasMore(true);
		getData(1);

	}, [source]);



	const openUrl = async (record) => {
		window.open(record.source_url, "_blank");
		try {
			const response = await Axios.post(`/api/UserClick/`,
				{ newsarticle: parseInt(record.id) },
				{ headers: { 'X-CSRFToken': csrftoken } }
			);
		} catch (error) {
      console.error("Failed to post click");
    }
	};


	useEffect(() => {
    const fetchUserBookmarks = async () => {
      try {
        const response = await Axios.get(`/api/UserBookmarks/`);
        const bookmarks = response.data.map(row => row.newsarticle_bookmarked);
        setUserBookmarks(bookmarks);
      } catch (error) {
        console.error("Failed to fetch user bookmarks");
      }
    };
    fetchUserBookmarks();
  }, []);



	const toggleUserFollow = async (article_id) => {
		const isFollowed = userfollows.includes(article_id)

		setUserFollows(prev =>
			isFollowed 
				? prev.filter(id => id !== article_id)
				: [...prev, article_id]
		);

		try {
			const response = await Axios.post(
				`/api/SourceUserFollowToggle/`,
				{ source: article_id	},
				{ 
					withCredentials: true, 
					headers: { 'X-CSRFToken': csrftoken } 
				}
			);

			if (response.data.message === 'Follow removed' && !isFollowed) {
				setUserFollows(prev => [...prev, article_id]);
			} else if (response.data.message !== "Follow removed" && isFollowed) {
				setUserFollows(prev => prev.filter(id => id !== article_id));
			}
		} catch (error) {
			console.error("Failed to follow source");
		}
	};


	useEffect(() => {
		const fetchUserFollows = async () => {
			try {
				const response = await Axios.get(`/api/SourceUserFollowsAll/`);
				const follows = response.data.map(row => row.source);
				setUserFollows(follows);
			} catch(error) {
				console.error("Failed to fetch user follows");
			}
		};
		fetchUserFollows();
	}, []);


	const columns = [
		{
      title: "Date",
      dataIndex: "date_posted",
			key: 'date_posted',
      width: 150,
			align: 'left',
			defaultSortOrder: 'descend',
      sorter: (a, b) => moment(a.date_posted) - moment(b.date_posted),
      render: (date_posted) => (
        <span className="ant-table-date" >{moment(date_posted).fromNow()}</span>
      ),
    },
    {
      title: "Source",
      dataIndex: "source_name",
      width: 250,
      key: 'source_name',
      align: "left",
      render: (source_name, record) => (
        <div>
        <span
					className="table-source"
					onClick={(e) => {
						e.stopPropagation(); 
						navigate(`/dashboard/source/${encodeURIComponent(source_name)}`);
					}}
				>
				{source_name}
				</span>
				<Tooltip
					title={
						!isauthenticated
							? "Log in to follow"
							: userfollows.includes(record.source_id)
								? "Unfollow"
								: "Follow"
					}
				>
				<span 
					onClick={(e) => {
					e.stopPropagation();
					toggleUserFollow(record.source_id);
					}}>
				<PlusOutlined
					style={{
						fontSize: 12,
						marginLeft: 5,
						color: !isauthenticated
							? "#868686" 
							: userfollows.includes(record.source_id) 
							? "#ff0000" 
							: "#868686",
					}}
				/>
				</span>
				</Tooltip>
				</div>
      ),
    },
    {
      title: "Title",
      dataIndex: "title",
			align: "left",
			key: 'title', 
      sorter: (a, b) => a.title.length - b.title.length,
      render: (_, record) => (
			<div>
				<span 
					className="table-title"
					onClick={() => openUrl(record)}
					>
				{record.title}
			</span>
			<div style={{marginTop: 10, }}>
				<span 
					onClick={(e) => {
						navigate(`/dashboard/tag/${encodeURIComponent(record.tag1)}?scrollToTop=true`);
						}}
					>
				<Tag className="table-tag" color={"purple"}>{record.tag1}</Tag>
				</span>
				<span
					onClick={(e) => {
						navigate(`/dashboard/tag/${encodeURIComponent(record.tag2)}?scrollToTop=true`);
						}}
					>
				<Tag className="table-tag" color={"green"}>{record.tag2}</Tag>
				</span>
				<span
					onClick={(e) => {
						navigate(`/dashboard/tag/${encodeURIComponent(record.tag3)}?scrollToTop=true`);
						}}
					>
				<Tag className="table-tag" color={"blue"}>{record.tag3}</Tag>
				</span>
			</div>
			</div>
      ),
    },
		{
      title: "User rating",
      dataIndex: "average_rating",
			key: 'average_rating',
      width: 200,
			align: "left",
      sorter: (a, b) => a.average_rating - b.average_rating,
      render: (average_rating) => {
				const value = average_rating ? Math.min(Math.ceil(average_rating), 5) : 0;
    		return (
					<span>
					<Rate value={value} disabled style={{ fontSize: 9 }} />
					</span>
				)
			},
    },
		{
			title: 'Actions',
			key: 'operation',
			align: 'center',
			width: 170,
			render: (record) => (
				<div>
				<Tooltip
					placement="top"
					title={
						!isauthenticated 
						? "Log in to add bookmark"
						:	userbookmarks.includes(record.id) 
						? "Remove" 
						: "Add bookmark"}
				>
				<Popover 
					placement="right"
					content={<DashboardBookmarkFeedPopover
						article={record}
						setUserBookmarks={setUserBookmarks}

						/>}
					trigger='click'
					color="rgba(26, 26, 26, 0.9)"
				>
				<StarOutlined
					style={{
						marginRight: 20,
						fontSize: 15,
						color: !isauthenticated
						? "#868686" 
						: userbookmarks.includes(record.id) 
						? "#ffac00" 
						: "#868686",
					}}
				/>
				</Popover>	
				</Tooltip>
					<span 
						style={{ marginRight: 20}}
						onClick={(e) => {
						e.stopPropagation();
					}}>
				<Popover
					placement="right"
					content={<PopOverContent record={record}/>}
					trigger='click'
					color="rgba(26, 26, 26, 0.9)"
				>
				<Tooltip 
					placement="top"
					title={"Article stats"}
				>
				<StockOutlined 
					style={{ 
						color: "#868686", 
						fontSize: 15, }}	
				/>
				</Tooltip>
				</Popover>
				</span>
			</div>
			),
		},
  ];


	const onChangeSorter = (sorter) => {
    console.log(sorter);
  };


	return (
		<>
			<Layout>
				<div className="div-data-manager">
      	{loading ? (
        <div style={{ 
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
					height: "100%",
					width: "100%",
					textAlign: "center",
				  }}>
				<SyncOutlined spin style={{color: "#5e5e5e", fontSize: 24,}}/>
				</div>
				) : (
					<>
					<div style={{ flex: 1, minHeight: 0, overflowY: "auto" }} >
					<Table
						className={"custom-scrollbar"}
						columns={columns}
						dataSource={tabledata}
						pagination={false}
						onChange={onChangeSorter}
						onRow={(record) => ({
							style: { cursor: "pointer", marginTop: 0, },
							})} 
						size="large"
						rowKey="id"
						sticky={true}
					/>
					 {!loading && hasMore && (
							<div style={{ textAlign: "center", marginTop: 16, flexShrink: 0, height: 70, }}>
								<Button
									type="secondary"
									loading={loadingMore}
									onClick={() => getData(page + 1)}
								>
									{loadingMore ? "Loading..." : "Load more"}
								</Button>
							</div>
						)}
						</div>
					</>
				)}
				</div>
			</Layout>
		</>
	);
};
export default ArticlesSourceApp; 