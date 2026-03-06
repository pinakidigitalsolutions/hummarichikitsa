import React from 'react';

const SkeletonCard = ({ layout = 'horizontal' }) => (
    <div className={`bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 animate-pulse w-full ${layout === 'vertical' ? 'flex flex-col' : ''}`}>
        <div className={layout === 'vertical' ? 'w-full h-48' : 'md:flex'}>
            <div className={layout === 'vertical' ? 'w-full h-full bg-gray-200' : 'md:w-1/3 h-64 bg-gray-200'} />
            <div className={`p-6 ${layout === 'vertical' ? 'w-full' : 'md:w-2/3'} space-y-4`}>
                <div className="h-6 bg-gray-200 rounded w-1/2" />
                <div className="h-4 bg-gray-200 rounded w-1/3" />
                <div className="h-4 bg-gray-200 rounded w-2/3" />
                <div className="flex gap-2 mt-4">
                    <div className="h-6 w-20 bg-gray-200 rounded-full" />
                    <div className="h-6 w-20 bg-gray-200 rounded-full" />
                    <div className="h-6 w-20 bg-gray-200 rounded-full" />
                </div>
                <div className="flex justify-between mt-6">
                    <div className="h-4 bg-gray-200 rounded w-24" />
                    <div className="h-10 w-32 bg-gray-200 rounded" />
                </div>
            </div>
        </div>
    </div>
);

export default SkeletonCard;
