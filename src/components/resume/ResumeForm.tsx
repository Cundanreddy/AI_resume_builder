import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Plus, Trash2, Mic, MicOff } from 'lucide-react';
import { Resume } from '../../types';
import { resumeAPI } from '../../services/api';
import toast from 'react-hot-toast';
import VoiceInput from './VoiceInput';

const ResumeForm: React.FC = () => {
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [currentSection, setCurrentSection] = useState<string>('');
  const [currentField, setCurrentField] = useState<string>('');

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<Resume>({
    defaultValues: {
      personalInfo: {
        fullName: '',
        email: '',
        phone: '',
        address: ''
      },
      summary: '',
      education: [{ institution: '', degree: '', field: '', startYear: '', endYear: '', gpa: '' }],
      experience: [{ company: '', position: '', startDate: '', endDate: '', description: '' }],
      skills: []
    }
  });

  const {
    fields: educationFields,
    append: appendEducation,
    remove: removeEducation
  } = useFieldArray({
    control,
    name: 'education'
  });

  const {
    fields: experienceFields,
    append: appendExperience,
    remove: removeExperience
  } = useFieldArray({
    control,
    name: 'experience'
  });

  useEffect(() => {
    loadResume();
  }, []);

  const loadResume = async () => {
    try {
      const response = await resumeAPI.getResume();
      if (response.data.resume) {
        const resume = response.data.resume;
        Object.keys(resume).forEach(key => {
          if (key !== '_id' && key !== 'userId' && key !== 'createdAt' && key !== 'updatedAt') {
            setValue(key as keyof Resume, resume[key]);
          }
        });
      }
    } catch (error) {
      // Resume doesn't exist yet, which is fine
    }
  };

  const onSubmit = async (data: Resume) => {
    try {
      await resumeAPI.createResume(data);
      toast.success('Resume saved successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save resume');
    }
  };

  const handleVoiceInput = (text: string) => {
    if (currentSection && currentField) {
      const fieldPath = `${currentSection}.${currentField}` as keyof Resume;
      setValue(fieldPath, text);
    }
  };

  const startVoiceInput = (section: string, field: string) => {
    setCurrentSection(section);
    setCurrentField(field);
    setIsVoiceMode(true);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create Your Resume</h1>
          <button
            type="button"
            onClick={() => setIsVoiceMode(!isVoiceMode)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              isVoiceMode 
                ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
            }`}
          >
            {isVoiceMode ? (
              <>
                <MicOff className="w-5 h-5" />
                <span>Stop Voice Input</span>
              </>
            ) : (
              <>
                <Mic className="w-5 h-5" />
                <span>Enable Voice Input</span>
              </>
            )}
          </button>
        </div>

        {isVoiceMode && (
          <VoiceInput
            onTextReceived={handleVoiceInput}
            isActive={isVoiceMode}
            onStop={() => setIsVoiceMode(false)}
          />
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Personal Information */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <div className="flex">
                  <input
                    {...register('personalInfo.fullName', { required: 'Full name is required' })}
                    type="text"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your full name"
                  />
                  <button
                    type="button"
                    onClick={() => startVoiceInput('personalInfo', 'fullName')}
                    className="px-3 py-3 border border-l-0 border-gray-300 rounded-r-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <Mic className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
                {errors.personalInfo?.fullName && (
                  <p className="mt-1 text-sm text-red-600">{errors.personalInfo.fullName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <div className="flex">
                  <input
                    {...register('personalInfo.email', { required: 'Email is required' })}
                    type="email"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your email"
                  />
                  <button
                    type="button"
                    onClick={() => startVoiceInput('personalInfo', 'email')}
                    className="px-3 py-3 border border-l-0 border-gray-300 rounded-r-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <Mic className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
                {errors.personalInfo?.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.personalInfo.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone
                </label>
                <div className="flex">
                  <input
                    {...register('personalInfo.phone', { required: 'Phone is required' })}
                    type="tel"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your phone number"
                  />
                  <button
                    type="button"
                    onClick={() => startVoiceInput('personalInfo', 'phone')}
                    className="px-3 py-3 border border-l-0 border-gray-300 rounded-r-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <Mic className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
                {errors.personalInfo?.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.personalInfo.phone.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <div className="flex">
                  <input
                    {...register('personalInfo.address', { required: 'Address is required' })}
                    type="text"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your address"
                  />
                  <button
                    type="button"
                    onClick={() => startVoiceInput('personalInfo', 'address')}
                    className="px-3 py-3 border border-l-0 border-gray-300 rounded-r-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <Mic className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
                {errors.personalInfo?.address && (
                  <p className="mt-1 text-sm text-red-600">{errors.personalInfo.address.message}</p>
                )}
              </div>
            </div>
          </section>

          {/* Summary */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Professional Summary</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Summary
              </label>
              <div className="flex">
                <textarea
                  {...register('summary', { required: 'Summary is required' })}
                  rows={4}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Write a brief professional summary"
                />
                <button
                  type="button"
                  onClick={() => startVoiceInput('', 'summary')}
                  className="px-3 py-3 border border-l-0 border-gray-300 rounded-r-lg bg-gray-50 hover:bg-gray-100 transition-colors self-start"
                >
                  <Mic className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              {errors.summary && (
                <p className="mt-1 text-sm text-red-600">{errors.summary.message}</p>
              )}
            </div>
          </section>

          {/* Education */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">Education</h2>
              <button
                type="button"
                onClick={() => appendEducation({ institution: '', degree: '', field: '', startYear: '', endYear: '', gpa: '' })}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span>Add Education</span>
              </button>
            </div>
            
            {educationFields.map((field, index) => (
              <div key={field.id} className="border border-gray-200 rounded-lg p-6 mb-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-800">Education {index + 1}</h3>
                  {educationFields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeEducation(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    {...register(`education.${index}.institution` as const, { required: 'Institution is required' })}
                    placeholder="Institution"
                    className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    {...register(`education.${index}.degree` as const, { required: 'Degree is required' })}
                    placeholder="Degree"
                    className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    {...register(`education.${index}.field` as const, { required: 'Field of study is required' })}
                    placeholder="Field of Study"
                    className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    {...register(`education.${index}.gpa` as const)}
                    placeholder="GPA (optional)"
                    className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    {...register(`education.${index}.startYear` as const, { required: 'Start year is required' })}
                    placeholder="Start Year"
                    className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    {...register(`education.${index}.endYear` as const, { required: 'End year is required' })}
                    placeholder="End Year"
                    className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            ))}
          </section>

          {/* Experience */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">Work Experience</h2>
              <button
                type="button"
                onClick={() => appendExperience({ company: '', position: '', startDate: '', endDate: '', description: '' })}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span>Add Experience</span>
              </button>
            </div>
            
            {experienceFields.map((field, index) => (
              <div key={field.id} className="border border-gray-200 rounded-lg p-6 mb-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-800">Experience {index + 1}</h3>
                  {experienceFields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeExperience(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <input
                    {...register(`experience.${index}.company` as const, { required: 'Company is required' })}
                    placeholder="Company"
                    className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    {...register(`experience.${index}.position` as const, { required: 'Position is required' })}
                    placeholder="Position"
                    className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    {...register(`experience.${index}.startDate` as const, { required: 'Start date is required' })}
                    placeholder="Start Date"
                    type="date"
                    className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    {...register(`experience.${index}.endDate` as const, { required: 'End date is required' })}
                    placeholder="End Date"
                    type="date"
                    className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <textarea
                  {...register(`experience.${index}.description` as const, { required: 'Description is required' })}
                  placeholder="Job Description"
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>
            ))}
          </section>

          {/* Skills */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Skills</h2>
            <div>
              <textarea
                {...register('skills')}
                placeholder="Enter your skills separated by commas (e.g., JavaScript, React, Node.js)"
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>
          </section>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Saving...' : 'Save Resume'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResumeForm;