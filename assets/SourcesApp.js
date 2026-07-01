import React, { useState, useEffect, useRef } from 'react';
import { 
	Layout,
	Tooltip,
	Table,
	Button,
	Rate,
 } from 'antd';
import { 
	SyncOutlined,
	PlusOutlined,
} from '@ant-design/icons';
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthProvider.js";
import { getCookie } from './ManagerUtility.js';
import { useSourceFollow } from './ManagerHooks.js';
import TableSources from './TableSources.js';


var csrftoken = getCookie('csrftoken');


const SourcesApp = () => {
	const [tabledata, setstate] = useState([]);
  const [loading, setloading] = useState(true);
	const { isauthenticated, user } = useAuth();

	const [page, setPage] = useState(1);
	const [hasMore, setHasMore] = useState(true);
	const [loadingMore, setLoadingMore] = useState(false);

	const navigate = useNavigate();

	const tableContainerRef = useRef(null);

	const {
		userfollows,
		toggleUserFollow
	} = useSourceFollow();


	const getData = async (pageNumber = 1) => {
		try {
			if (pageNumber === 1) {
				setloading(true);
			} else {
				setLoadingMore(true);
			}
		const response = await axios.get(`/api/NewsSourcesAll?page=${pageNumber}`);
		
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
			console.error("Failed to fetch data");
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
					<div style={{ flex: 1, minHeight: 0, overflowY: "auto", }}>
					
					<TableSources
						tabledata={tabledata}
						userfollows={userfollows}
						toggleUserFollow={toggleUserFollow}
						isauthenticated={isauthenticated}
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
export default SourcesApp; 