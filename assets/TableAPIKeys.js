import React, {useState, useEffect} from 'react';
import { 
	Table,
	Rate,
	Button,
	Tooltip,
 } from 'antd';
import { 
	SyncOutlined,
	PlusOutlined,
	CheckCircleOutlined,
	CloseCircleOutlined,
	ToolOutlined,
} from '@ant-design/icons';
import axios from 'axios';
import moment from 'moment';
import { useNavigate, useParams, useLocation, Link } from "react-router-dom";
import { useAuth } from './AuthProvider.js';


const TableAPIKeys = ({ 
		tabledata,
	}) => {
		
	const columns = [
		{
			title: "Created",
			dataIndex: "date_created",
			key: 'date_created',
			width: 70,
			align: 'left',
			defaultSortOrder: 'descend',
			sorter: (a, b) => moment(a.date_created) - moment(b.date_created),
			render: (date_created) => (
				<span className="ant-table-date" >{moment(date_created).fromNow()}</span>
			),
		},
		{
			title: "Name of Key",
			dataIndex: "name_of_key",
			width: 200,
			align: "left",
			key: 'name_of_key', 
			sorter: (a, b) => a.name_of_key - b.name_of_key,
			render: (name_of_key) => (
				<>
				<span	className="api-table-key-name">
				{name_of_key}
				</span>
				</>
			)
		},
		{
			title: "Status",
			dataIndex: "is_active",
			width: 100,
			align: "center",
			key: 'is_active', 
			sorter: (a, b) => a.is_active - b.is_active,
			render: (is_active) => {
				if (is_active === true) {
					return <CheckCircleOutlined style={{ color: "#0c8b00"}} />
				} else {
					return <CloseCircleOutlined style={{ color: "#df2d00"}} />
				}
			},
		},
		{
			title: "Token limit",
			dataIndex: "tokens_limit",
			width: 100,
			align: "center",
			key: 'tokens_limit', 
			sorter: (a, b) => a.tokens_limit - b.tokens_limit,
			render: (tokens_limit) => (
				<div className='api-table-cell'>
				{tokens_limit}
				</div>
			),
		},
		{
			title: "Token usage",
			dataIndex: "total_tokens_used",
			width: 100,
			align: "center",
			key: 'total_tokens_used', 
			sorter: (a, b) => a.total_tokens_used - b.total_tokens_used,
			render: (total_tokens_used) => (
				<div className='api-table-cell'>
				{total_tokens_used}
				</div>
			),
		},
		{
			title: 'Edit',
			key: 'operation',
			align: 'center',
			width: 100,
			render: (record) => (
				<div>
				<Link to={`/dashboard/api/edit/${record.id}`}>
					<ToolOutlined
						style={{
							marginTop: 5,
							fontSize: 16,
							color: "#969696",
							cursor: 'pointer',
						}}
					/>
				</Link>
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
export default TableAPIKeys; 