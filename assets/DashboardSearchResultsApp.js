import React, {useState, useEffect, useRef} from 'react';
import { 
	Layout,
	Button,
 } from 'antd';
import { 
	SyncOutlined,
} from '@ant-design/icons';
import axios from "axios";
import { useSearchParams, useParams, useLocation } from "react-router-dom";
import { useAuth } from "./AuthProvider.js";
import { useBookmarks, useSourceFollow } from './ManagerHooks.js';
import { getCookie } from './ManagerUtility.js';
import TableArticles from './TableArticles.js';


var csrftoken = getCookie('csrftoken');


const DashboardSearchResultsApp = () => {
	const { isauthenticated, user } = useAuth();
	const [tabledata, setstate] = useState([]);
  const [loading, setLoading] = useState(true);

	const [page, setPage] = useState(1);
	const [hasMore, setHasMore] = useState(true);
	const [loadingMore, setLoadingMore] = useState(false);

	const [searchParams] = useSearchParams();

	const { pathname, search } = useLocation();
	const params = new URLSearchParams(search);

	const tableContainerRef = useRef(null);


	useEffect(() => {
		if (params.get('scrollToTop') === 'true') {
			window.scrollTo(0, 0);
		}
	}, [pathname, search]);


	useEffect(() => {
		if (tableContainerRef.current) {
				tableContainerRef.current.scrollTop = 0;
		}
	}, [searchParams]);


	const {
			userbookmarks,
			setUserBookmarks
		} = useBookmarks();

	
	const {
		userfollows,
		toggleUserFollow
	} = useSourceFollow();


	useEffect(() => {
		setPage(1);
		setHasMore(true);
		setstate([]);
		getData(1);
	}, [searchParams]);


  const getData = async (pageNumber = 1) => {

		if (pageNumber === 1) {
			setLoading(true);
		} else {
			setLoadingMore(true);
		}

		const paramsObject = Object.fromEntries(searchParams.entries());

		try {
			const response = await axios.get(`/api/search-results`, 
				{ 
					params: 
					{
						...paramsObject,
						page: pageNumber 
					}
				});

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
			setLoading(false);
			setLoadingMore(false);
		};
	};


	return (
		<>
			<Layout>
					<div className="div-data-manager">
						{loading ? (
						<div className="table-sync-container">
						<SyncOutlined spin style={{color: "#5e5e5e", fontSize: 24,}}/>
						</div>
						) : (
							<>
							<div 
								ref={tableContainerRef}
								style={{ flex: 1, minHeight: 0, overflowY: "auto", }}
							>

							<TableArticles
								tabledata={tabledata}
								userfollows={userfollows}
								toggleUserFollow={toggleUserFollow}
								isauthenticated={isauthenticated}
								userbookmarks={userbookmarks}
								setUserBookmarks={setUserBookmarks}
							/>

							{!loading && hasMore && (
								<div className='table-load-button-container'>
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
export default DashboardSearchResultsApp; 