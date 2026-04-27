import React, {useState, useEffect} from 'react';
import { 
	Layout,
	Table,
	Rate,
	Popover,
	Tooltip,
	Tag,
 } from 'antd';
import { 
SyncOutlined,
StockOutlined,
StarOutlined,
PlusOutlined,
} from '@ant-design/icons';
import Axios from "axios";
import moment from 'moment';
import PopOverContent from './StatsNewsArticle.js';
import { useNavigate, useSearchParams } from "react-router-dom";
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


const DashboardSearchResultsApp = () => {
	const [tabledata, setstate] = useState([]);
  const [loading, setloading] = useState(true);
  const [userbookmarks, setUserBookmarks] = useState([]);
	const [userfollows, setUserFollows] = useState([]);
	const { isauthenticated, user } = useAuth();
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();


	useEffect(() => {
		if (!isauthenticated) {
			return;
		};

		setloading(true);
    const getData = async () => {
			const paramsObject = Object.fromEntries(searchParams.entries());
      try {
        const response = await Axios.get(`/api/search-results`, 
					{ params: paramsObject });

        setloading(false);
        setstate(
          response.data.map(row => ({
            id: row.id,
            source: row.source,
						source_id: row.source_id,
            source_name: row.source_name,
            source_url: row.source_url,
            title: row.title,
            date_posted: row.date_posted,
            language: row.language,
            category_primary: row.category_primary,
						category_primary_name: row.category_primary_name,
						category_primary_id: row.category_primary_id,
            tag1: row.tag1,
            tag2: row.tag2,
            tag3: row.tag3,
            algo_rating: parseFloat(row.algo_rating),
						average_rating: parseFloat(row.average_rating),
						clicks_count: parseFloat(row.clicks_count), 
						average_sourcerating: parseFloat(row.average_sourcerating),
						average_algo_sourcerating: parseFloat(row.average_algo_sourcerating),
          }))
        );
      } catch (error) {
        console.error("Failed to fetch article data");
      }
    };
    getData();
  }, [searchParams]);


	const countClick = async (record) => {
		window.open(record.source_url, "_blank");
		try {
			const response = await Axios.post(`/api/UserClick/`,
				{ newsarticle: Number(record.id) },
				{ 
					withCredentials: true,
					headers: { 'X-CSRFToken': csrftoken } 
				}
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


	const toggleUserFollow = async (record) => {
		const isFollowed = userfollows.includes(record.source_id)

		setUserFollows(prev =>
			isFollowed 
				? prev.filter(id => id !== record.source_id)
				: [...prev, record.source_id]
		);

		try {
			const response = await Axios.post(`/api/SourceUserFollowToggle/`,
				{ source: record.source_id },
				{ headers: { 'X-CSRFToken': csrftoken } }
			);

			if (response.data.message === 'Follow removed' && !isFollowed) {
				setUserFollows(prev => [...prev, record.source_id]);
			} else if (response.data.message !== "Follow removed" && isFollowed) {
				setUserFollows(prev => prev.filter(id => id !== record.source_id));
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
      title: "Uploaded",
      dataIndex: "date_posted",
			key: 'date_posted',
      width: 15,
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
      width: 25,
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
							? "Log in to follow source"
							: userfollows.includes(record.source_id)
								? "Unfollow source"
								: "Follow source"
					}
				>
				<span 
					onClick={(e) => {
						e.stopPropagation();
						toggleUserFollow(record);
					}}>
				<PlusOutlined
					style={{
						fontSize: 12,
						marginLeft: 5,
						color: userfollows.includes(record.source_id) ? "#ff0000" : "#868686",
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
      width: 70,
			align: "left",
			key: 'title',
			// ellipsis: true,
      sorter: (a, b) => a.title - b.title,
      render: (_, record) => (
				<div>
        <span 
					className={"table-title"}
					onClick={() => countClick(record)}
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
      width: 20,
			align: "center",
      sorter: (a, b) => a.average_rating - b.average_rating,
      render: (average_rating) => {
				const value = average_rating ? Math.min(Math.ceil(average_rating), 5) : 0;
    		return (
					<span>
					<Rate value={value} disabled style={{ fontSize: 9 }} />
					</span>
				);
			},
    },
		{
			title: 'Actions',
			key: 'operation',
			align: 'center',
			width: 15,
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
					title={"Show stats"}
				>
			<StockOutlined 
				style={{ 
					color: "#868686", 
					fontSize: 15, }}	/>
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
						display: 'flex', 
						justifyContent: 'center', 
						alignItems: 'center', 
						height: 650, 
						width: '100%', 
						textAlign: 'center'
						}}>
					<SyncOutlined spin style={{color: "#5e5e5e", fontSize: 24,}}/>
					</div>
					) : (
						<Table
							className={"custom-scrollbar"}
							columns={columns}
							dataSource={tabledata}
							pagination={false}
							scroll={{ y: 800 }}
							onChange={onChangeSorter}
							onRow={() => ({
								style: { cursor: "pointer", marginTop: 0, },
								})} 
							size="large"
						/>
					)}
					</div>
			</Layout>
		</>
	);
};
export default DashboardSearchResultsApp; 