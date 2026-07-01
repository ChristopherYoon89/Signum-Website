import React, {useState, useEffect} from 'react';
import { 
	Table,
	Rate,
	Tooltip,
 } from 'antd';
import { 
	SyncOutlined,
	PlusOutlined,
} from '@ant-design/icons';
import axios from 'axios';
import { useNavigate, useParams, useLocation, Link } from "react-router-dom";
import { useAuth } from './AuthProvider.js';


const TableSources = ({ 
		tabledata,
		userfollows,
		toggleUserFollow,
		isauthenticated,
	}) => {

		
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
				<span	className="table-source">
				<Link to={`/dashboard/source/${encodeURIComponent(name)}`}>
				{name}
				</Link>
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
					toggleUserFollow(record.id);
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
			<Table
				className={"custom-scrollbar"}
				columns={columns}
				dataSource={tabledata}
				pagination={false}
				onChange={onChangeSorter}
				onRow={() => ({
					style: { marginTop: 0, },
					})} 
				size="large"
				rowKey="id"
				sticky={true}							
			/>
		</>
	);
};
export default TableSources; 