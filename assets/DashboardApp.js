import React, { useState, useEffect } from 'react';
import { 
	Menu,
	Layout,
	Row,
	Col,
 } from 'antd';
import { 
	NotificationOutlined,
	ReadOutlined,
	AppstoreAddOutlined,
	ApiOutlined,
  } from '@ant-design/icons';
import { useLocation, useNavigate, Outlet } from 'react-router-dom';
import SidebarApp from './SidebarApp.js';
import DashboardTopMenu from './DashboardTopMenu.js';
import 'antd/dist/antd.min.css';

const { Content, Sider } = Layout;


function getItem(label, key, icon, children, type, url, pageTitle) {
	return {
		key,
		icon,
		children,
		label, 
		type,
		url,
		pageTitle,
	};
}


const items = [
	getItem('Dashboard', 'sub1', <AppstoreAddOutlined />, [
		getItem('Briefing', 'feed', null, null, null, '/dashboard/briefing', 'Briefing'),
		getItem('Bookmarks', 'bookmarks', null, null, null, '/dashboard/bookmarks', 'Bookmarks'),
		getItem('Settings', 'settings', null, null, null, '/dashboard/settings', 'Settings'),
		getItem('Profile', 'profile', null, null, null, '/dashboard/profile', 'Profile'),
	]),
  getItem('Articles', 'sub2', <ReadOutlined />, [
		getItem('All', 'All-Articles', null, null, null, '/dashboard/category/All-Articles', 'All Articles'),
		getItem('World', 'Worldwide', null, null, null, '/dashboard/category/Worldwide', 'Worldwide'),
		getItem('USA', 'USA', null, null, null, '/dashboard/category/USA', 'USA'),
		getItem('Europe', 'Europe', null, null, null, '/dashboard/category/Europe', 'Europe'),
		getItem('Middle East', 'Middle East', null, null, null, '/dashboard/category/Middle East', 'Middle East'),
		getItem('Asia', 'Asia', null, null, null, '/dashboard/category/Asia', 'Asia'),
		getItem('Africa', 'Africa', null, null, null, '/dashboard/category/Africa', 'Africa'),
		getItem('Latin America', 'Latin America', null, null, null, '/dashboard/category/Latin America', 'Latin America'),
		getItem('Money & Finance', 'Money & Finance', null, null, null, '/dashboard/category/Money & Finance', 'Money & Finance'),
		getItem('Companies', 'Companies', null, null, null, '/dashboard/category/Companies', 'Companies'),
		getItem('Energy & Commodities', 'Commodities', null, null, null, '/dashboard/category/Commodities', 'Energy & Commodities'),
		getItem('Bitcoin', 'Bitcoin', null, null, null, '/dashboard/category/Bitcoin', 'Bitcoin'),
		getItem('Tech', 'Tech', null, null, null, '/dashboard/category/Tech', 'Tech'),
		getItem('Science', 'Science', null, null, null, '/dashboard/category/Science', 'Science'),
		getItem('Culture & Philosophy', 'Culture', null, null, null, '/dashboard/category/Culture', 'Culture'),
		getItem('Panorama & Crime', 'Panorama', null, null, null, '/dashboard/category/Panorama', 'Panorama'),
	]),
	getItem('Sources', 'sub3', <NotificationOutlined />, [
		getItem('My Sources', 'my-sources', null, null, null, '/dashboard/mysources', 'My Sources'),
		getItem('All Sources', 'all-sources', null, null, null, '/dashboard/all-sources', 'All Sources'),
	]),	
	getItem('API', 'api', <ApiOutlined />, null, null, '/dashboard/api', 'Add API Key'),
]


const DashboardApp = () => {
	const [openKeys, setOpenKeys] = useState([]);
	const [title, setTitle] = useState('');

	let navigate = useNavigate();
	const { pathname, search } = useLocation();
  const params = new URLSearchParams(search);


	useEffect(() => {
    if (params.get('scrollToTop') === 'true') {
      window.scrollTo(0, 0);
      params.delete('scrollToTop');
      navigate(`${pathname}?${params.toString()}`, { replace: true });
    }
  }, [pathname, search, navigate]);
 



	const findItemByKey = (items, key) => {
		for (const item of items) {
			if (item.key === key) return item;
			if (item.children) {
				const found = findItemByKey(item.children, key);
				if (found) return found;
			}
		}
		return null;
	};


	const onClickMenu = (e) => {
		const item = findItemByKey(items, e.key);
			if (item?.url) {
				navigate(item.url);
			}
	};


	const findItemByUrl = (items, pathname) => {
		for (const item of items) {
			if (item.url && pathname.startsWith(item.url)) {
				return item;
			}

			if (item.children) {
				const found = findItemByUrl(item.children, pathname);
				if (found) return found;
			}
		}
		return null;
	};


	const selectedItem = findItemByUrl(items, decodeURIComponent(pathname));
	const selectedKey = selectedItem?.key;
	const selectedKeys = selectedKey ? [selectedKey] : [];


	useEffect(() => {
		const decodedPath = decodeURIComponent(pathname);
		const item = findItemByUrl(items, decodedPath);

		if (decodedPath === '/dashboard/briefing/addfeed') return setTitle('Add Feed');
		if (decodedPath.includes('delete-feed')) return setTitle('Delete Feed')
		if (decodedPath.startsWith('/dashboard/briefing/editfeed')) return setTitle('Edit Feed');
		if (decodedPath === '/dashboard/bookmarks/addfeed') return setTitle('Add Bookmark List');
		if (decodedPath === '/dashboard/bookmarks/editfeed') return setTitle('Edit Bookmark List');
		if (decodedPath === '/dashboard/export') return setTitle('Export Data');
		if (decodedPath.startsWith('/dashboard/source')) return setTitle('Source');
		if (decodedPath.startsWith('/dashboard/tag')) return setTitle('Tag');
		if (decodedPath === '/dashboard/api/edit') return setTitle('Edit API Key');
		if (decodedPath.startsWith('/dashboard/bookmarks')) return setTitle('Bookmarks');
		if (decodedPath.startsWith('/dashboard/mysources')) return setTitle('My Sources');
		if (decodedPath.startsWith('/dashboard/search')) return setTitle('Search');

		if (item) {
			setTitle(item.pageTitle);
			return;
		}

		setTitle('');
	}, [pathname]);


	const onOpenChange = (keys) => {
    setOpenKeys(keys);
	};


	const getParentKey = (pathname) => {
    if (
        pathname.startsWith("/dashboard/briefing") ||
        pathname.startsWith("/dashboard/settings") ||
        pathname.startsWith("/dashboard/bookmarks") ||
        pathname.startsWith("/dashboard/profile")
    ) {
        return "sub1";
    }

    if (pathname.startsWith("/dashboard/category")) {
        return "sub2";
    }

    if (
        pathname.startsWith("/dashboard/mysources") ||
        pathname.startsWith("/dashboard/all-sources")
    ) {
        return "sub3";
    }

    return null;
	};


	useEffect(() => {
    const parent = getParentKey(pathname);

    if (parent) {
        setOpenKeys(prev => {
            if (prev.includes(parent)) {
                return prev;
            }

            return [...prev, parent];
        });
    }
	}, [pathname]);


	return (
		<>
			<Layout className="bg-light">
				<Sider trigger={null}
					className='bg-dark'
				>
				
				<div className="scrollable-menu" style={{ maxHeight: '850px', overflowY: 'auto', }}>
				
				<Menu
					openKeys={openKeys}
					onOpenChange={onOpenChange}
					theme= 'dark'
					mode="inline"
					items={items}
					onClick={onClickMenu}
					style={{ height: '100%', }}
					selectedKeys={selectedKeys}
					className='bg-dark'
				/>
				
				</div>
				</Sider>
					
				<Content className='signum-menu-content'>
				<DashboardTopMenu title={title} />
				<Row gutter={{
					xs: 8,
					sm: 16,
					md: 24,
					lg: 32,
				}}

				>
				<Col className='gutter-row' style={{ marginLeft: 0, paddingTop: 15, display: 'flex', flexDirection: 'column' }} span={21}>
				<Outlet />
				</Col>

				<Col className="gutter-row" span={3}>
					<SidebarApp />
				</Col>
				</Row>
				</Content>
			</Layout>
		</>
	)
};
export default DashboardApp;
