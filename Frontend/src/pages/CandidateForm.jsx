    import React, { useState } from "react";

    const CandidateForm = ({ setShowForm, onSave }) => {
    const [formData, setFormData] = useState({});
    const [education, setEducation] = useState([{}]);
    const [experience, setExperience] = useState([{}]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const addEducation = () => setEducation([...education, {}]);
    const addExperience = () => setExperience([...experience, {}]);

    const handleSubmit = () => {
    onSave(formData);
    };

    return (
        <div className="bg-gray-100 min-h-screen">

        {/* HEADER */}
        <div className="sticky top-0 z-10 bg-white border-b px-6 py-4 flex justify-between items-center">
            <div>
            <h1 className="text-xl font-semibold">Create Candidate</h1>
            <p className="text-sm text-gray-500">
                Add new candidate to your talent pool
            </p>
            </div>

            <div className="flex gap-3">
            <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border rounded-xl bg-white"
            >
                Cancel
            </button>

    <button
    onClick={handleSubmit}
    className="px-4 py-2 rounded-xl bg-blue-600 text-white"
    >
    Save Candidate
    </button>
            </div>
        </div>

        <form className="p-6 space-y-6 max-w-6xl mx-auto">

            {/* BASIC INFO */}
            <Card title="Basic Information">
            <Grid>
                <Input label="First Name \*" name="firstName" placeholder="Enter first name" onChange={handleChange} />
                <Input label="Last Name \*" name="lastName" placeholder="Enter last name" onChange={handleChange} />
                <Input label="Email \*" name="email" placeholder="email@example.com" onChange={handleChange} />
                <Input label="Mobile" name="mobile" placeholder="+91 9876543210" onChange={handleChange} />
                <Input label="Phone" name="phone" placeholder="+91 9876543210" onChange={handleChange} />
                <Input label="Fax" name="fax" placeholder="+91 9876543210" onChange={handleChange} />
            </Grid>

            <Input label="Website" name="website" placeholder="https://example.com" onChange={handleChange} />
            <Textarea label="Summary Headline" name="summary" placeholder="Brief professional summary" onChange={handleChange} />
            </Card>

            {/* ADDRESS */}
            <Card title="Address Information">
            <Input label="Street" name="street" placeholder="Street address" onChange={handleChange} />

            <Grid>
                <Input label="City" name="city" placeholder="City" onChange={handleChange} />
                <Input label="Province/State" name="state" placeholder="Province or State" onChange={handleChange} />
                <Input label="Postal Code" name="postal" placeholder="Postal code" onChange={handleChange} />
                <Input label="Country" name="country" placeholder="Country" onChange={handleChange} />
            </Grid>
            </Card>

            {/* PROFESSIONAL */}
            <Card title="Professional Details">
            <Grid>
                <Input label="Experience (Years)" name="experience" placeholder="e.g., 5" onChange={handleChange} />
                <Select label="Highest Qualification" name="qualification" options={["B.Tech", "MBA", "BCA"]} onChange={handleChange} />
                <Input label="Current Job Title" name="jobTitle" placeholder="e.g., Software Engineer" onChange={handleChange} />
                <Input label="Current Employer" name="company" placeholder="Company name" onChange={handleChange} />
                <Input label="Current Salary" name="currentSalary" placeholder="e.g., 500000" onChange={handleChange} />
                <Input label="Expected Salary" name="expectedSalary" placeholder="e.g., 700000" onChange={handleChange} />
                <Input label="Notice Period" name="noticePeriod" placeholder="e.g., 30 days" onChange={handleChange} />
                <Input label="Available From" name="available" placeholder="dd-mm-yyyy" onChange={handleChange} />
            </Grid>

            <Input label="Skill Set" name="skills" placeholder="Type a skill and press Enter" onChange={handleChange} />
            </Card>

            {/* SOCIAL */}
            <Card title="Social Links">
            <Grid>
                <Input label="LinkedIn" name="linkedin" placeholder="linkedin.com/in/username" onChange={handleChange} />
                <Input label="Facebook" name="facebook" placeholder="facebook.com/username" onChange={handleChange} />
                <Input label="Twitter" name="twitter" placeholder="twitter.com/username" onChange={handleChange} />
            </Grid>
            </Card>

            {/* OTHER */}
            <Card title="Other Information">
            <Grid>
                <Select label="Candidate Status" name="status" options={["Active", "Interview", "Selected"]} onChange={handleChange} />
                <Select label="Source" name="source" options={["Direct", "Referral", "Vendor"]} onChange={handleChange} />
                <Input label="Created Owner" name="owner" placeholder="Current User" onChange={handleChange} />
            </Grid>
            </Card>

            {/* EDUCATION */}
            <Card title="Education Details" action={<AddButton text="Add Education" onClick={addEducation} />}>
            {education.map((_, i) => (
                <Grid key={i}>
                <Input label="Degree" placeholder="e.g., Bachelor of Science" />
                <Input label="Institution" placeholder="University name" />
                <Input label="Year" placeholder="e.g., 2020" />
                </Grid>
            ))}
            </Card>

            {/* EXPERIENCE */}
            <Card title="Experience Details" action={<AddButton text="Add Experience" onClick={addExperience} />}>
            {experience.map((_, i) => (
                <Grid key={i}>
                <Input label="Job Title" placeholder="Software Engineer" />
                <Input label="Company" placeholder="Company name" />
                <Input label="Duration" placeholder="2020 - Present" />
                <Input label="Description" placeholder="Brief description" />
                </Grid>
            ))}
            </Card>

            {/* ATTACHMENTS */}
            <Card title="Attachments">
            <div className="grid md:grid-cols-3 gap-4">
                {["Resume", "Formatted Resume", "Cover Letter", "Offer", "Other Docs", "Contract"].map((item) => (
                <div
                    key={item}
                    className="border-2 border-dashed rounded-2xl p-6 text-center text-gray-500 hover:bg-gray-50"
                >
                    ⬆️
                    <p className="mt-2 font-medium">{item}</p>
                    <p className="text-xs">Click to upload</p>
                </div>
                ))}
            </div>
            </Card>

        </form>
        </div>
    );
    };

    /* ---------- COMPONENTS ---------- */

    const Card = ({ title, children, action }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold">{title}</h2>
        {action}
        </div>
        <div className="space-y-4">{children}</div>
    </div>
    );

    const Grid = ({ children }) => (
    <div className="grid md:grid-cols-2 gap-4">{children}</div>
    );

    const Input = ({ label, ...props }) => (
    <div>
        <label className="text-sm text-gray-600 mb-1 block">
        {label}
        </label>

        <input
        {...props}
        className="w-full px-4 py-2.5 rounded-xl
        bg-gray-50
        border border-gray-200
        shadow-sm
        focus:bg-white
        focus:border-blue-400
        focus:ring-2 focus:ring-blue-100
        transition-all duration-200 outline-none"
        />
    </div>
    );

    const Textarea = ({ label, ...props }) => (
    <div>
        <label className="text-sm text-gray-600 mb-1 block">{label}</label>
    <textarea
    {...props}
    className="w-full px-4 py-2.5 rounded-xl h-24
    bg-gray-50
    border border-gray-200

    shadow-sm

    focus:bg-white

    focus:border-blue-400

    focus:ring-2 focus:ring-blue-100

    transition-all duration-200 outline-none"

    />

    &#x20; </div>

    );



    const Select = ({ label, options = [], ...props }) => (

    <div>

    <label className="text-sm text-gray-600 mb-1 block">

    {label}

    </label>



    <select

    {...props}

    className="w-full px-4 py-2.5 rounded-xl

    bg-gray-50

    border border-gray-200

    shadow-sm

    focus:bg-white

    focus:border-blue-400

    focus:ring-2 focus:ring-blue-100

    transition-all duration-200 outline-none"

    >

    <option value="">Select</option>

    {options.map((o, i) => (

    <option key={i} value={o}>

    {o}

    </option>

    ))}

    </select>

    </div>

    );



    const AddButton = ({ text, onClick }) => (
<button

    type="button"

    onClick={onClick}

    className="px-3 py-1 border rounded-xl text-sm"

>

    + {text}

    </button>

    );

    export default CandidateForm;

    