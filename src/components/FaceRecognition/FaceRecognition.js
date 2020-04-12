import React from 'react';
import './FaceRecognition.css';

const FaceRecognition = ({ imageUrl, box }) => {
	return(
		<div className = 'center'>
			<div className='absolute mt2'>	
				<img id='inputimage' src={imageUrl} alt='' width='500px' height='auto' />
				{ box.length > 0 ? 
						box.map((i) => <div className='bounding-box' key={i.leftCol} style={{top: i.topRow, right: i.rightCol, bottom: i.bottomRow, left: i.leftCol}}></div>) 
					: ''
				}
			</div>
		</div>
	)
}

export default FaceRecognition;