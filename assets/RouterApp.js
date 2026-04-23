import React, {useState} from 'react';
import { Route, Routes } from 'react-router-dom';
import DashboardApp from './DashboardApp.js';
import SourcesApp from './SourcesApp.js';
import ArticlesSourceApp from './ArticlesSourceApp.js';
import ArticlesTagsApp from './ArticlesTagsApp.js';
import HomeApp from './HomeApp.js';
import ArticlesCategoryApp from './ArticlesCategoryApp.js';
import DashboardBookmarkFeedBoardApp from './DashboardBookmarkFeedBoardApp.js';
import ProfileSourcesApp from './ProfileSourcesApp.js';
import DashboardFeedBoardApp from './DashboardFeedBoard.js';
import DashboardSettingsApp from './DashboardSettingsApp.js';
import RouterProtectedRoute from './RouterProtectedRoute.js';
import DashboardFeedAddApp from './DashboardFeedAddApp.js';
import DashboardFeedEditApp from './DashboardFeedEditApp.js';
import DashboardSearchApp from './DashboardSearchApp.js';
import DashboardSearchResultsApp from './DashboardSearchResultsApp.js';
import DashboardProfileApp from './DashboardProfileApp.js';
import APIAppEdit from './APIAppEdit.js';
import APIAppAdd from './APIAppAdd.js'; 
import DashboardBookmarkFeedAddApp from './DashboardBookmarkFeedAddApp.js';
import DashboardBookmarkFeedEditApp from './DashboardBookmarkFeedEditApp.js';
import DashboardBookmarkFeedDeleteApp from './DashboardBookmarkFeedDeleteApp.js';
import DashboardFeedDeleteApp from './DashboardFeedDeleteApp.js';
import DashboardExportDataApp from './DashboardExportDataApp.js';


const AppRouter = () => (
	<Routes>
		<Route exact path="/" element={<HomeApp />} />
		<Route 
			path="/dashboard" 
			element={
			<RouterProtectedRoute>
				<DashboardApp />
			</RouterProtectedRoute>
			}>
			<Route path="briefing" >
				<Route index element={<DashboardFeedBoardApp />} />
				<Route path="addfeed" element={<DashboardFeedAddApp />} />
				<Route path="editfeed/:feed_id" element={<DashboardFeedEditApp />} />
				<Route path="editfeed/:feed_id/delete-feed" element={<DashboardFeedDeleteApp />} />
			</Route>
			<Route path="settings" element={<DashboardSettingsApp />} />
			<Route path="export" element={<DashboardExportDataApp />} />
			<Route path="search">
				<Route index element={<DashboardSearchApp />} />
				<Route path="results" element={<DashboardSearchResultsApp />} />
			</Route>
			<Route path="category/:categoryName" element={<ArticlesCategoryApp />} />
			<Route path="source/:sourceName" element={<ArticlesSourceApp />} />
			<Route path="all-sources" element={<SourcesApp />} /> 
			<Route path="tag/:tagName" element={<ArticlesTagsApp />} />
			<Route path="bookmarks">
				<Route index element={<DashboardBookmarkFeedBoardApp />} />
				<Route path="addfeed" element={<DashboardBookmarkFeedAddApp />} />
				<Route path="editfeed/:feed_id" element={<DashboardBookmarkFeedEditApp />} />
				<Route path="editfeed/:feed_id/delete-feed" element={<DashboardBookmarkFeedDeleteApp />} />
			</Route>
			<Route path="mysources" element={<ProfileSourcesApp />} />
			<Route path="profile" element={<DashboardProfileApp />} />
			<Route path="api">
				<Route index element={<APIAppAdd />} />
				<Route path="edit" element={<APIAppEdit />} />
			</Route>
		</Route>
	</Routes>
);
export default AppRouter;