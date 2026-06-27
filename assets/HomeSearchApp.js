import React, { useState, useEffect, useMemo } from 'react';
import {
	Card,
	Input,
	Button,
	Row,
	Col,
	Layout,
	Tooltip,
	Divider,
	Alert,
	Select,
	Dropdown,
	DatePicker,
	AutoComplete,
  } from 'antd';
import {
	QuestionCircleOutlined,
} from '@ant-design/icons';
import axios from 'axios';
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "./AuthProvider.js";
import moment from 'moment-timezone';
import { getCookie } from './ManagerUtility.js';


var csrftoken = getCookie('csrftoken');


const InputSearch = ({ 
		searchinput, 
		onChangeSearchInput, 
		handleSearch, 
		searchdropdowndata, 
		opendropdown,  
	}) => {
	return(
		<>
			<div className="sig-form-input">
      <AutoComplete
        options={searchdropdowndata}
        style={{ width: "100%" }}
				popupClassName="search-autocomplete-dropdown"
      >
        <Input
					value={searchinput}
					onChange={(e) => onChangeSearchInput(e.target.value)}
          placeholder="The world’s largest database with high-quality news and analysis"
          onPressEnter={handleSearch}
        />
      </AutoComplete>
    </div>
		</>
	);
};


const HomeSearchApp = () => {
	const { isauthenticated, user } = useAuth();
	const [searchinput, setSearchInput] = useState('');
	const [opendropdown, setOpenDropdown] = useState(false);
	const [searchdropdowndata, setSearchDropdownData] = useState([]);
	
	const [showalert, setShowAlert] = useState(false);
	const [alertmessage, setAlertMessage] = useState('');
	const [alerttype, setAlertType] = useState('');
	const [alertdescription, setAlertDescription] = useState('');
	
	const [showfilters, setShowFilters] = useState(false);
	const [feedinclsourcesdisabled, setFeedInclSourcesDisabled] = useState(false);
	const [feedexclsourcesdisabled, setFeedExclSourcesDisabled] = useState(false);
	
	const navigate = useNavigate();

	
	const navigate_search_page = () => {
		window.scrollTo({top: 0,behavior: "smooth"});
		navigate("/search-results");
	};


	const onChangeSearchInput = (value) => {
		console.log(value);
		setSearchInput(value);
		setOpenDropdown(true);
	};

	useEffect(() => {

    const timeout = setTimeout(() => {
        fetchSuggestions(searchinput);
    }, 300);

    return () => clearTimeout(timeout);

	}, [searchinput]);


	const fetchSuggestions = async (value) => {
		setOpenDropdown(true);

		if (value.length < 2) {
        setSearchDropdownData([]);
        return;
    }

		try {
			const response = await axios.get(`/api/search-suggestions`,
				{ 
					params: {
						keyword_string: value,
					}
				}
			);

			setSearchDropdownData(
				response.data.map(item => ({
					value: item
				}))
			);

		} catch(error) {
			console.log(`Error retrieving search keywords`, error);
		};
	};


	const handleSearch = () => {
		const isSearchInputValid = searchinput.trim().length > 0;
		
		if (!isSearchInputValid) {
			return;
		};
		
		const params = new URLSearchParams()
		params.set("q", searchinput);

		window.scrollTo({top: 0,behavior: "smooth"});
		navigate(`/search-results?${params.toString()}`);
	};


	const handleOpenChange = (open) => {
  	setOpenDropdown(open);
	};


	return (
		<>
			<Layout style={{ background: "transparent" }}>
				<Card className={"home-search-card"}>
					<Row>
						<Col span={24}>		
						
						<h1 className="home-header-search" style={{ textAlign: "center", marginTop: 0, }}>SEARCH</h1>
						
						<div className="home-search-engine-container" >
						
						<InputSearch 
							searchinput={searchinput}
							onChangeSearchInput={onChangeSearchInput}
							handleSearch={handleSearch}
							searchdropdowndata={searchdropdowndata} 
						/>

						<Button 
							type='primary'
							onClick={() => handleSearch()}
							style={{ marginTop: 5, marginLeft: 15 }}
						>
						Search
						</Button>
						</div>
							
						</Col>
					</Row>
				
					<div className="home-search-info-container">
						<p>
						<Link
							to="/dashboard/search"
							onClick={() => {
									window.scrollTo({
											top: 0,
											behavior: 'smooth'
									});
							}}
						>
						<span
							className='sig-form-more-filters'
							style={{ textAlign: "left", flex: 1}}
						>
						Advanced search
						</span>
						</Link>
						</p>	
					</div>
					
				</Card>
			</Layout>
		</>
	);
};
export default HomeSearchApp;


