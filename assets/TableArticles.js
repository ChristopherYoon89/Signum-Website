import React, {useState, useEffect} from 'react';
import { 
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
import axios from 'axios';
import moment from 'moment';
import { useNavigate, useParams, useLocation, Link } from "react-router-dom";
import PopOverContent from './StatsNewsArticle.js';
import { useAuth } from './AuthProvider.js';
import DashboardBookmarkFeedPopover from './DashboardBookmarkFeedPopover.js';
import { countClick } from './ManagerUtility.js';



const TableArticles = ({ 
		tabledata,
		userfollows,
		toggleUserFollow,
		isauthenticated,
		userbookmarks,
		setUserBookmarks,
	}) => {

	
	const onChangeSorter = (sorter) => {
    console.log(sorter);
  };

	const columns = [
		{
      title: "Uploaded",
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
        <span	className="table-source">
				<Link to={`/dashboard/source/${encodeURIComponent(source_name)}`}>
				{source_name}
				</Link>
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
						cursor: 'pointer',
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
					<Link to={`/dashboard/tag/${encodeURIComponent(record.tag1)}?scrollToTop=true`}>
					<Tag className="table-tag" color={"purple"}>{record.tag1}</Tag>
					</Link>
					
					<Link to={`/dashboard/tag/${encodeURIComponent(record.tag2)}?scrollToTop=true`}>
					<Tag className="table-tag" color={"green"}>{record.tag2}</Tag>
					</Link>
					
					<Link to={`/dashboard/tag/${encodeURIComponent(record.tag3)}?scrollToTop=true`}>
					<Tag className="table-tag" color={"blue"}>{record.tag3}</Tag>
					</Link>
					
				</div>
				</div>	
      ),
    },
    {
      title: "User rating",
      dataIndex: "average_rating",
			key: 'average_rating',
			align: "center",
			width: 200,
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
			width: 170,
			render: (record) => (
			<div>
				
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
				className="antd-home-icon"
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
				
			<StockOutlined 
				className="antd-home-icon"
				style={{ 
					color: "#868686", 
					fontSize: 15, }}	
			/>
			</Popover>
			</span>
			</div>
			),
		},
  ];
	
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
export default TableArticles; 