import React, { useState } from 'react';
import {
	Card,
  } from 'antd';


const HomeCategories = () => {
	const [isopen, setIsOpen] = useState(false);

	const categories_pol = [
		'Worldwide',
		'USA',
		'Europe',
		'Middle East',
		'Asia',
		'Latin America',
		'Africa',
	];


	const categories_econ = [
		'Money & Finance',
		'Companies',
		'Commodities',
		'Bitcoin',
	];


	const categories_cult = [
		'Tech',
		'Science',
		'Culture',
		'Panorama',
	];
	

	const toggleMenu = () => {
    setIsOpen(!isopen);
  };


	return(
		<>			
			<Card className='category-container-center' >
					<div className='home-categories-container'>
					
					<button className='toggle-button' onClick={toggleMenu}>
						{isopen ? 'Close Categories' : 'Toggle Categories'}
					</button>
					
					<div className={`category-grid-container ${isopen ? 'open' : 'closed'}`}>
						<h3>Politics</h3>
						<div className={'category-grid'}>
							{
								categories_pol.map((category, index) => (
								<button
									key={index}
									className='btn-category'
									onClick={() => {
										window.location.hash = `#${category}`;
									}}
								> 
								{category}
								</button>
								))
							}
						</div>
						
						<h3>Economics</h3>
						<div className={'category-grid'}>
							{
								categories_econ.map((category, index) => (
								<button
									key={index}
									className="btn-category"
									onClick={() => {
										window.location.hash = `#${category}`;
									}}
								> 
								{category}
								</button>
								))
							}
						</div>
						
						<h3>Tech & Culture</h3>
						<div className={`category-grid`}>
						{
							categories_cult.map((category, index) => (
							<button
								key={index}
								className="btn-category"
								onClick={() => {
									window.location.hash = `#${category}`;
								}}
							> 
								{category}
							</button>
							))
						}
						</div>	
					</div>
				</div>
			</Card>
		</>
	);
};
export default HomeCategories;