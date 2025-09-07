
import React, { useState } from 'react';
import Card from './Card';
import { MOCK_KB_ARTICLES } from '../constants';

const KnowledgeBase: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredArticles = MOCK_KB_ARTICLES.filter(article =>
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.content.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div>
            <h2 className="text-3xl font-bold mb-6 text-white">Knowledge Base</h2>
            <div className="mb-6">
                <input
                    type="text"
                    placeholder="Search for solutions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
            </div>
            <div className="space-y-4">
                {filteredArticles.map(article => (
                    <Card key={article.id}>
                        <h3 className="text-xl font-bold text-teal-400">{article.title}</h3>
                        <p className="text-sm text-gray-500 mb-2">Category: {article.category} | Auto-created: {article.createdAt}</p>
                        <p className="text-gray-300">{article.content}</p>
                        <p className="text-xs text-gray-600 mt-3">Based on resolved ticket #{article.resolvedTicketId}</p>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default KnowledgeBase;
