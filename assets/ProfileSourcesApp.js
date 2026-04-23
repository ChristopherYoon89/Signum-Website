import React, {useState, useEffect} from 'react';
import { 
	Layout,
	Tooltip,
	Table,
	Button,
	Rate,
 } from 'antd';
import { 
SyncOutlined,
StockOutlined,
PlusOutlined,
} from '@ant-design/icons';
import Axios from "axios";
import axios from 'axios';
import moment from 'moment';
import { useNavigate, useParams, useLocation } from "react-router-dom";
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


const ProfileSourcesApp = () => {
	const [tabledata, setstate] = useState([]);
  const [loading, setloading] = useState(true);
	const [userfollows, setUserFollows] = useState([]);
	const { isauthenticated, user } = useAuth();
	const navigate = useNavigate();

	const { pathname, search } = useLocation();
	const params = new URLSearchParams(search);

	const [page, setPage] = useState(1);
	const [hasMore, setHasMore] = useState(true);
	const [loadingMore, setLoadingMore] = useState(false);


	useEffect(() => {
			if (params.get('scrollToTop') === 'true') {
				window.scrollTo(0, 0);
				params.delete('scrollToTop');
				navigate(`${pathname}?${params.toString()}`, { replace: true });
			}
		}, [pathname, search, navigate]);


	const getData = async (pageNumber = 1) => {
			try {
					if (pageNumber === 1) {
						setloading(true);
					} else {
						setLoadingMore(true);
					}
					const response = await Axios.get(`/api/mysources?page=${pageNumber}`);
					
					const newData = response.data.results.map(row => ({
							id: row.id,
							name: row.name,
							average_rating: row.average_rating,
							average_algo_rating: row.average_algo_rating,
							article_count: row.article_count,
						}));
						if (pageNumber === 1) {
								setstate(newData);
							} else {
								setstate(prev => [...prev, ...newData]);
							}
							setHasMore(response.data.next !== null);
							setPage(pageNumber);
			} catch (error) {
					console.error("Error fetching bookmarks");
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

	}, []);


	const toggleUserFollow = async (record) => {
		const isFollowed = userfollows.includes(record.id)

		setUserFollows(prev =>
			isFollowed 
				? prev.filter(id => id !== record.id)
				: [...prev, record.id]
		);

		try {
			const response = await Axios.post(
				`/api/SourceUserFollowToggle/`,
				{ source: record.id,	},
				{ headers: { 'X-CSRFToken': csrftoken } }
			);

			if (response.data.message === 'Follow removed' && !isFollowed) {
				setUserFollows(prev => [...prev, record.id]);
			} else if (response.data.message !== "Follow removed" && isFollowed) {
				setUserFollows(prev => prev.filter(id => id !== record.id));
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
			title: "Source",
			dataIndex: "name",
			key: 'name',
			width: 50,
			align: 'left',
			defaultSortOrder: 'descend',
			sorter: (a, b) => a.name - b.name,
			render: (name, record) => (
				<span
					style={{ cursor: 'pointer', }}
					className="table-source"
					onClick={(e) => {
						e.stopPropagation(); 
						navigate(`/dashboard/source/${encodeURIComponent(name)}`);
					}}
				>
				{name}
				</span>
			),
		},
		{
			title: "No. of Articles",
			dataIndex: "article_count",
			width: 30,
			align: "center",
			key: 'article_count', 
			sorter: (a, b) => a.article_count - b.article_count,
			render: (article_count) => {
				const value = article_count ? Math.min(Math.ceil(article_count), 5) : 0;
				return <span className='allsources-table-value'>{value}</span>
			},
		},
		{
			title: "Avg. User Rating",
			dataIndex: "average_rating",
			width: 30,
			align: "left",
			key: 'average_rating', 
			sorter: (a, b) => a.average_rating - b.average_rating,
			render: (average_rating) => {
				const value = average_rating ? Math.min(Math.ceil(average_rating), 5) : 0;
				return <Rate value={value} disabled style={{ fontSize: 11 }} />;
			},
		},
		{
			title: "Avg. Algo Rating",
			dataIndex: "average_algo_rating",
			width: 30,
			align: "left",
			key: 'average_algo_rating', 
			sorter: (a, b) => a.average_algo_rating - b.average_algo_rating,
			render: (average_algo_rating) => {
				const value = average_algo_rating ? Math.min(Math.ceil(average_algo_rating), 5) : 0;
				return <Rate value={value} disabled style={{ fontSize: 11 }} />;
			},
		},
		{
			title: 'Actions',
			key: 'operation',
			align: 'center',
			width: 15,
			render: (record) => (
				<div>
				<span onClick={(e) => {
					e.stopPropagation();
					toggleUserFollow(record);
				}}>
				<Tooltip
					placement="top"
					title={
						!isauthenticated ? "Log in to follow source"
						: userfollows.includes(record.id)
						? "Unfollow"
						: "Follow"
										
										
					}
				>
				<PlusOutlined
					style={{
						fontSize: 15,
						marginRight: 20,
						cursor: 'pointer',
						color: !isauthenticated
							? "#868686" 
							: userfollows.includes(record.id) 
							? "#ff0000" 
							: "#868686",
						
					}}
				/>
				</Tooltip>
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
						<>
						<Table
							className={"custom-scrollbar"}
							columns={columns}
							dataSource={tabledata}
							pagination={false}
							scroll={{ y: 600 }}
							onChange={onChangeSorter}
							onRow={() => ({
								style: { cursor: "pointer", marginTop: 0, },
								})} 
							size="large"
							rowKey="id"
						/>
						
						{!loading && hasMore && (
							<div style={{ textAlign: "center", marginTop: 16 }}>
								<Button
									type="secondary"
									loading={loadingMore}
									onClick={() => getData(page + 1)}
								>
									{loadingMore ? "Loading..." : "Load more"}
								</Button>
							</div>
						)}

					</>
					)}
				</div>
			</Layout>
		</>
	);
};
export default ProfileSourcesApp; 