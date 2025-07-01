import React, { useEffect, useState } from 'react';
import { Download, Edit, Eye } from 'lucide-react';
import { Resume } from '../../types';
import { resumeAPI } from '../../services/api';
import { generatePDF } from '../../utils/pdfGenerator';
import toast from 'react-hot-toast';

const ResumePreview: React.FC = () => {
  const [resume, setResume] = useState<Resume | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadResume();
  }, []);

  const loadResume = async () => {
    try {
      const response = await resumeAPI.getResume();
      setResume(response.data.resume);
    } catch (error) {
      toast.error('No resume found. Please create one first.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!resume) return;
    
    try {
      await generatePDF(resume);
      toast.success('Resume downloaded successfully!');
    } catch (error) {
      toast.error('Failed to download resume');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading resume...</p>
        </div>
      </div>
    );
  }

  if (!resume) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Eye className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Resume Found</h2>
          <p className="text-gray-600 mb-6">Create your resume first to see the preview.</p>
          <a
            href="/dashboard"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Edit className="w-5 h-5 mr-2" />
            Create Resume
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Resume Preview</h1>
              <p className="text-gray-600 mt-2">Review your resume before downloading</p>
            </div>
            <div className="flex space-x-4">
              <a
                href="/dashboard"
                className="flex items-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Edit className="w-5 h-5 mr-2" />
                Edit Resume
              </a>
              <button
                onClick={handleDownloadPDF}
                className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download className="w-5 h-5 mr-2" />
                Download PDF
              </button>
            </div>
          </div>
        </div>

        {/* Resume Content */}
        <div id="resume-content" className="bg-white rounded-2xl shadow-xl p-12 max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center border-b-2 border-gray-200 pb-6 mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {resume.personalInfo.fullName}
            </h1>
            <div className="flex justify-center items-center space-x-6 text-gray-600">
              <span>{resume.personalInfo.email}</span>
              <span>•</span>
              <span>{resume.personalInfo.phone}</span>
              <span>•</span>
              <span>{resume.personalInfo.address}</span>
            </div>
          </div>

          {/* Summary */}
          {resume.summary && (
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-300 pb-2">
                Professional Summary
              </h2>
              <p className="text-gray-700 leading-relaxed">{resume.summary}</p>
            </section>
          )}

          {/* Education */}
          {resume.education && resume.education.length > 0 && (
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-300 pb-2">
                Education
              </h2>
              {resume.education.map((edu, index) => (
                <div key={index} className="mb-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {edu.degree} in {edu.field}
                      </h3>
                      <p className="text-gray-700 font-medium">{edu.institution}</p>
                    </div>
                    <div className="text-right text-gray-600">
                      <p>{edu.startYear} - {edu.endYear}</p>
                      {edu.gpa && <p>GPA: {edu.gpa}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </section>
          )}

          {/* Experience */}
          {resume.experience && resume.experience.length > 0 && (
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-300 pb-2">
                Work Experience
              </h2>
              {resume.experience.map((exp, index) => (
                <div key={index} className="mb-6">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{exp.position}</h3>
                      <p className="text-gray-700 font-medium">{exp.company}</p>
                    </div>
                    <p className="text-gray-600">
                      {new Date(exp.startDate).toLocaleDateString()} - {new Date(exp.endDate).toLocaleDateString()}
                    </p>
                  </div>
                  <p className="text-gray-700 leading-relaxed">{exp.description}</p>
                </div>
              ))}
            </section>
          )}

          {/* Skills */}
          {resume.skills && resume.skills.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-300 pb-2">
                Skills
              </h2>
              <div className="flex flex-wrap gap-2">
                {(typeof resume.skills === 'string' ? resume.skills.split(',') : resume.skills).map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                  >
                    {skill.trim()}
                  </span>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumePreview;