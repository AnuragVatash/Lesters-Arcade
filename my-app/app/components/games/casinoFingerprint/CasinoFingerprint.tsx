'use client';

import React, {useEffect, useState} from 'react';

export default function CasinoFingerprint() {
  const [selectedFingerprints, setSelectedFingerprints] = useState<number[]>([]);

  const handleFingerprintClick = (index: number) => {
    console.log('Clicked fingerprint:', index);
    console.log('Fingerprint number:', fingerprintOrder[index] + 1);
    console.log('Currently selected:', selectedFingerprints);
  };

  const [fingerprintOrder,setFingerprintOrder] = useState([0,1,2,3,4,5,6,7])
  
  useEffect(() => {
    const shuffledOrder = [...fingerprintOrder];
    for(let i = shuffledOrder.length -1; i > 0; i--){
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledOrder[i],shuffledOrder[j]] = [shuffledOrder[j],shuffledOrder[i]];
    }
    setFingerprintOrder(shuffledOrder);
  }, []);

  return (
    <div><h1 className = 'mt-[200px] mb-0 text-center text-4xl'>Casino Fingerprint Game</h1>
    <div className="flex flex-row">
      <div className='w-1/2'>
    <div className="grid grid-cols-2 gap-x-8 gap-y-8 ">
        <img src={`/casinoFingerprints/casino1print${fingerprintOrder[0] + 1}.jpg`} onClick={() => handleFingerprintClick(0)}/>
        <img src={`/casinoFingerprints/casino1print${fingerprintOrder[1] + 1}.jpg`} onClick={() => handleFingerprintClick(1)}/>
        <img src={`/casinoFingerprints/casino1print${fingerprintOrder[2] + 1}.jpg`} onClick={() => handleFingerprintClick(2)}/>
        <img src={`/casinoFingerprints/casino1print${fingerprintOrder[3] + 1}.jpg`} onClick={() => handleFingerprintClick(3)}/>
        <img src={`/casinoFingerprints/casino1print${fingerprintOrder[4] + 1}.jpg`} onClick={() => handleFingerprintClick(4)}/>
        <img src={`/casinoFingerprints/casino1print${fingerprintOrder[5] + 1}.jpg`} onClick={() => handleFingerprintClick(5)}/>
        <img src={`/casinoFingerprints/casino1print${fingerprintOrder[6] + 1}.jpg`} onClick={() => handleFingerprintClick(6)}/>
        <img src={`/casinoFingerprints/casino1print${fingerprintOrder[7] + 1}.jpg`} onClick={() => handleFingerprintClick(7)}/>
        </div>
        </div>
        <div className='w-1/2'>
          <p>Right side placeholder</p>
        </div>
    </div>
    </div>
  );
}