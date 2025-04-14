import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Footer from "../shared/Footer";
import NavBar from "../components/NavBar";
import AdminSidebar from '../components/AdminSidebar';
import { Bar, BarChart, XAxis, YAxis, Tooltip, Legend, LineChart, Line, CartesianGrid, PieChart, Pie, Cell } from "recharts";
import { Container, Row, Col, Card, Button, Table, Modal, Form, Badge, Spinner } from "react-bootstrap";
import { Bell, User, ChevronDown, Plus, MessageSquare, List, X, Database, AlertTriangle, RotateCw } from "lucide-react";
import { Link } from "react-router-dom";
import { API_URL } from '../config';
import toast from 'react-hot-toast';
import SmartQuery from '../components/SmartQuery';
import '../styles/SmartQuery.css';

const AdminDashboard = () => {
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [resourceData, setResourceData] = useState([]);
    const [resourceLoading, setResourceLoading] = useState(true);
    const [resourceError, setResourceError] = useState(null);
    const [activeTab, setActiveTab] = useState(() => {
        // Set initial activeTab based on current path
        if (location.pathname === '/admin/escalated') return 'escalated';
        if (location.pathname === '/admin/resource-management') return 'resource';
        if (location.pathname === '/admin/settings') return 'settings';
        return 'dashboard';
    });
    const [escalatedGrievances, setEscalatedGrievances] = useState([]);
    const [showResponseModal, setShowResponseModal] = useState(false);
    const [selectedGrievance, setSelectedGrievance] = useState(null);
    const [escalationResponse, setEscalationResponse] = useState('');
    const [newAssignedTo, setNewAssignedTo] = useState('');
    const [officials, setOfficials] = useState([]);
    const [escalatedLoading, setEscalatedLoading] = useState(false);
    const [escalatedError, setEscalatedError] = useState(null);
    const [departmentStats, setDepartmentStats] = useState([]);
    const [monthlyStats, setMonthlyStats] = useState([]);
    const [dashboardLoading, setDashboardLoading] = useState(false);
    const [dashboardError, setDashboardError] = useState(null);
    const [quickStats, setQuickStats] = useState({
        totalCases: { value: 0, trend: '0%' },
        activeCases: { value: 0, trend: '0%' },
        resolvedCases: { value: 0, trend: '0%' },
        departments: { value: 0, trend: 'Stable' }
    });
    const [responseTimeStats, setResponseTimeStats] = useState([]);
    const [priorityDistribution, setPriorityDistribution] = useState([]);
    const [departmentEfficiency, setDepartmentEfficiency] = useState([]);

    useEffect(() => {
        // Update activeTab when route changes
        if (location.pathname === '/admin/escalated') setActiveTab('escalated');
        else if (location.pathname === '/admin/resource-management') setActiveTab('resource');
        else if (location.pathname === '/admin/settings') setActiveTab('settings');
        else if (location.pathname === '/admin/dashboard') setActiveTab('dashboard');
    }, [location.pathname]);

    useEffect(() => {
        console.log('Active tab changed to:', activeTab);
        if (activeTab === 'dashboard') {
            fetchResourceData();
            fetchDashboardStats();
            fetchQuickStats();
            fetchAdditionalStats();
        } else if (activeTab === 'escalated') {
            fetchEscalatedGrievances();
            fetchOfficials();
        }
    }, [activeTab]);

    const fetchResourceData = async () => {
        try {
            setResourceLoading(true);
            setResourceError(null);

            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await fetch('http://localhost:5000/api/admin/resource-management', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch resource data');
            }

            const data = await response.json();
            setResourceData(data.resources);
        } catch (error) {
            console.error('Error fetching resource data:', error);
            setResourceError('Failed to load resource data');
        } finally {
            setResourceLoading(false);
        }
    };

    const fetchEscalatedGrievances = async () => {
        try {
            setEscalatedLoading(true);
            setEscalatedError(null);

            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await fetch(`${API_URL}/grievances/escalated`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch escalated grievances');
            }

            const data = await response.json();
            setEscalatedGrievances(data.grievances);
        } catch (error) {
            console.error('Error fetching escalated grievances:', error);
            setEscalatedError(error.message);
        } finally {
            setEscalatedLoading(false);
        }
    };

    const fetchOfficials = async (department) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await fetch(`${API_URL}/admin/officials?department=${department}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch officials');
            }

            const data = await response.json();
            // Filter officials by department
            setOfficials(data.officials.filter(official => official.department === department));
        } catch (error) {
            console.error('Error fetching officials:', error);
            toast.error('Failed to load officials');
        }
    };

    const handleOpenResponseModal = (grievance) => {
        setSelectedGrievance(grievance);
        // Fetch officials specific to the grievance department
        fetchOfficials(grievance.department);
        setShowResponseModal(true);
    };

    const fetchDashboardStats = async () => {
        try {
            setDashboardLoading(true);
            setDashboardError(null);

            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }

            // Fetch department performance data
            const deptResponse = await fetch(`${API_URL}/admin/department-stats`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!deptResponse.ok) {
                throw new Error('Failed to fetch department statistics');
            }

            const deptData = await deptResponse.json();
            setDepartmentStats(deptData.departmentStats);

            // Fetch monthly trends data
            const monthlyResponse = await fetch(`${API_URL}/admin/monthly-stats`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!monthlyResponse.ok) {
                throw new Error('Failed to fetch monthly statistics');
            }

            const monthlyData = await monthlyResponse.json();
            setMonthlyStats(monthlyData.monthlyStats);

        } catch (error) {
            console.error('Error fetching dashboard statistics:', error);
            setDashboardError('Failed to load dashboard statistics');
            toast.error('Failed to load dashboard statistics');
        } finally {
            setDashboardLoading(false);
        }
    };

    const fetchQuickStats = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await fetch(`${API_URL}/admin/quick-stats`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch quick statistics');
            }

            const data = await response.json();
            setQuickStats(data);
        } catch (error) {
            console.error('Error fetching quick statistics:', error);
            toast.error('Failed to load quick statistics');
        }
    };

    const fetchAdditionalStats = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }

            // Fetch response time statistics
            const responseTimeResponse = await fetch(`${API_URL}/admin/response-time-stats`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!responseTimeResponse.ok) {
                throw new Error('Failed to fetch response time statistics');
            }

            const responseTimeData = await responseTimeResponse.json();
            setResponseTimeStats(responseTimeData.stats);

            // Fetch priority distribution
            const priorityResponse = await fetch(`${API_URL}/admin/priority-distribution`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!priorityResponse.ok) {
                throw new Error('Failed to fetch priority distribution');
            }

            const priorityData = await priorityResponse.json();
            setPriorityDistribution(priorityData.distribution);

            // Fetch department efficiency
            const efficiencyResponse = await fetch(`${API_URL}/admin/department-efficiency`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!efficiencyResponse.ok) {
                throw new Error('Failed to fetch department efficiency');
            }

            const efficiencyData = await efficiencyResponse.json();
            setDepartmentEfficiency(efficiencyData.efficiency);

        } catch (error) {
            console.error('Error fetching additional statistics:', error);
            toast.error('Failed to load additional statistics');
        }
    };

    const handleRespondToEscalation = async () => {
        try {
            // Validate response
            if (!escalationResponse?.trim()) {
                toast.error('Please provide a response to the escalation');
                return;
            }

            if (!selectedGrievance?._id) {
                toast.error('Invalid grievance selected');
                return;
            }

            const token = localStorage.getItem('token');
            if (!token) {
                toast.error('Authentication token not found');
                return;
            }

            // Default status is 'assigned' when responding to escalation
            const status = 'assigned';
            const isReassignment = Boolean(newAssignedTo);
            let assignedOfficialDetails = null;

            // Get details of the newly assigned official if reassignment
            if (isReassignment) {
                const official = officials.find(off => off._id === newAssignedTo);
                if (!official) {
                    toast.error('Selected official not found');
                    return;
                }
                assignedOfficialDetails = {
                    firstName: official.firstName,
                    lastName: official.lastName
                };
            }

            const response = await fetch(`${API_URL}/grievances/${selectedGrievance._id}/escalation-response`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    escalationResponse: escalationResponse.trim(),
                    newStatus: status,
                    newAssignedTo: newAssignedTo || null,
                    isReassignment,
                    notification: isReassignment ? {
                        title: 'Grievance Reassigned',
                        message: `A grievance has been reassigned to you by admin: ${selectedGrievance.title}`,
                        type: 'reassignment',
                        grievanceId: selectedGrievance._id,
                        recipientId: newAssignedTo
                    } : null
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || data.details || 'Failed to submit escalation response');
            }

            // Show success message with reassignment details if applicable
            if (isReassignment && assignedOfficialDetails) {
                toast.success(`Grievance reassigned to ${assignedOfficialDetails.firstName} ${assignedOfficialDetails.lastName}`);
            } else {
                toast.success('Response submitted successfully');
            }

            setShowResponseModal(false);
            setEscalationResponse('');
            setNewAssignedTo('');
            setSelectedGrievance(null);
            fetchEscalatedGrievances();
        } catch (error) {
            console.error('Error responding to escalation:', error);
            toast.error(error.message || 'Failed to submit response');
        }
    };

    const handleTabChange = (tab) => {
        console.log('Changing tab to:', tab);
        setActiveTab(tab);
    };

    const getPriorityBadgeClass = (priority) => {
        switch (priority?.toLowerCase()) {
            case 'high':
                return 'danger';
            case 'medium':
                return 'warning';
            case 'low':
                return 'success';
            default:
                return 'secondary';
        }
    };

    const getStatusBadgeClass = (status) => {
        switch (status?.toLowerCase()) {
            case 'resolved':
                return 'success';
            case 'in-progress':
                return 'primary';
            case 'assigned':
                return 'info';
            case 'pending':
                return 'warning';
            default:
                return 'secondary';
        }
    };

    const renderDashboardCharts = () => (
        <Row className="mb-4">
            <Col md={6}>
                <Card className="p-3 shadow-sm">
                    <h6>Department Performance</h6>
                    {dashboardLoading ? (
                        <div className="text-center py-4">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    ) : dashboardError ? (
                        <div className="alert alert-danger">{dashboardError}</div>
                    ) : (
                        <BarChart
                            width={500}
                            height={300}
                            data={departmentStats}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="department" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="resolved" fill="#28a745" name="Resolved" barSize={50} />
                            <Bar dataKey="pending" fill="#ffc107" name="Pending" barSize={50} />
                            <Bar dataKey="inProgress" fill="#17a2b8" name="In Progress" barSize={50} />
                        </BarChart>
                    )}
                </Card>
            </Col>
            <Col md={6}>
                <Card className="p-3 shadow-sm">
                    <h6>Monthly Trends</h6>
                    {dashboardLoading ? (
                        <div className="text-center py-4">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    ) : dashboardError ? (
                        <div className="alert alert-danger">{dashboardError}</div>
                    ) : (
                        <LineChart width={400} height={250} data={monthlyStats}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="total" stroke="#007bff" name="Total Cases" />
                            <Line type="monotone" dataKey="resolved" stroke="#28a745" name="Resolved Cases" />
                        </LineChart>
                    )}
                </Card>
            </Col>
        </Row>
    );

    const renderAdditionalCharts = () => (
        <>
            <Row className="mb-4">
                <Col md={6}>
                    <Card className="p-3 shadow-sm h-100">
                        <h6>Average Response Time by Department</h6>
                        {dashboardLoading ? (
                            <div className="text-center py-4">
                                <Spinner animation="border" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </Spinner>
                            </div>
                        ) : dashboardError ? (
                            <div className="alert alert-danger">{dashboardError}</div>
                        ) : (
                            <BarChart
                                width={500}
                                height={300}
                                data={responseTimeStats}
                                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="department" />
                                <YAxis label={{ value: 'Hours', angle: -90, position: 'insideLeft' }} />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="averageResponseTime" fill="#8884d8" name="Avg Response Time (hrs)" />
                            </BarChart>
                        )}
                    </Card>
                </Col>
                <Col md={6}>
                    <Card className="p-3 shadow-sm h-100">
                        <h6>Priority Distribution</h6>
                        {dashboardLoading ? (
                            <div className="text-center py-4">
                                <Spinner animation="border" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </Spinner>
                            </div>
                        ) : dashboardError ? (
                            <div className="alert alert-danger">{dashboardError}</div>
                        ) : (
                            <div className="d-flex justify-content-center">
                                <PieChart width={400} height={300}>
                                    <Pie
                                        data={priorityDistribution}
                                        cx={200}
                                        cy={150}
                                        labelLine={false}
                                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {priorityDistribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={
                                                entry.name === 'High' ? '#dc3545' :
                                                    entry.name === 'Medium' ? '#ffc107' :
                                                        '#28a745'
                                            } />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </div>
                        )}
                    </Card>
                </Col>
            </Row>
            <Row className="mb-4">
                <Col md={12}>
                    <Card className="p-3 shadow-sm">
                        <h6>Department Efficiency Score</h6>
                        {dashboardLoading ? (
                            <div className="text-center py-4">
                                <Spinner animation="border" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </Spinner>
                            </div>
                        ) : dashboardError ? (
                            <div className="alert alert-danger">{dashboardError}</div>
                        ) : (
                            <BarChart
                                width={1000}
                                height={300}
                                data={departmentEfficiency}
                                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="department" />
                                <YAxis label={{ value: 'Efficiency Score (%)', angle: -90, position: 'insideLeft' }} />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="score" fill="#20c997" name="Efficiency Score" />
                                <Bar dataKey="responseRate" fill="#6610f2" name="Response Rate" />
                                <Bar dataKey="resolutionRate" fill="#fd7e14" name="Resolution Rate" />
                            </BarChart>
                        )}
                    </Card>
                </Col>
            </Row>
        </>
    );

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return (
                    <>
                        <Row className="mb-4">
                            <Col>
                                <h2>Admin Dashboard</h2>
                                <p className="text-muted">Welcome to the admin dashboard</p>
                            </Col>
                        </Row>

                        {/* Top Navbar */}
                        <div className="d-flex justify-content-between align-items-center bg-white p-3 shadow-sm mb-3">
                            <h4>Dashboard</h4>
                            <div className="d-flex align-items-center">
                                <Button variant="light" className="me-3 position-relative">
                                    <Bell size={20} />
                                    <span className="badge bg-danger position-absolute top-0 start-100 translate-middle">3</span>
                                </Button>
                                <div className="d-flex align-items-center">
                                    <div className="rounded-circle bg-primary text-white p-2 me-2">A</div>
                                    <span>Admin</span>
                                    <ChevronDown size={16} />
                                </div>
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <Row className="mb-4">
                            <Col md={3}>
                                <Card className="p-3 shadow-sm">
                                    <h6 className="text-muted">Total Cases</h6>
                                    <h4>{quickStats.totalCases.value}</h4>
                                    <span className="text-muted">{quickStats.totalCases.trend}</span>
                                </Card>
                            </Col>
                            <Col md={3}>
                                <Card className="p-3 shadow-sm">
                                    <h6 className="text-muted">Active Cases</h6>
                                    <h4>{quickStats.activeCases.value}</h4>
                                    <span className="text-muted">{quickStats.activeCases.trend}</span>
                                </Card>
                            </Col>
                            <Col md={3}>
                                <Card className="p-3 shadow-sm">
                                    <h6 className="text-muted">Resolved Cases</h6>
                                    <h4>{quickStats.resolvedCases.value}</h4>
                                    <span className="text-muted">{quickStats.resolvedCases.trend}</span>
                                </Card>
                            </Col>
                            <Col md={3}>
                                <Card className="p-3 shadow-sm">
                                    <h6 className="text-muted">Departments</h6>
                                    <h4>{quickStats.departments.value}</h4>
                                    <span className="text-muted">{quickStats.departments.trend}</span>
                                </Card>
                            </Col>
                        </Row>

                        {/* Charts */}
                        {renderDashboardCharts()}

                        {/* New Analytics Charts */}
                        {renderAdditionalCharts()}
                    </>
                );
            case 'escalated':
                return (
                    <Card className="shadow-sm">
                        <Card.Header className="d-flex justify-content-between align-items-center">
                            <h5 className="mb-0">Escalated Grievances</h5>
                            <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={fetchEscalatedGrievances}
                                disabled={escalatedLoading}
                            >
                                {escalatedLoading ? (
                                    <Spinner animation="border" size="sm" />
                                ) : (
                                    <>
                                        <RotateCw size={14} className="me-1" />
                                        Refresh
                                    </>
                                )}
                            </Button>
                        </Card.Header>
                        <Card.Body>
                            {escalatedLoading ? (
                                <div className="text-center py-4">
                                    <Spinner animation="border" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </Spinner>
                                </div>
                            ) : escalatedError ? (
                                <div className="alert alert-danger">{escalatedError}</div>
                            ) : (
                                <Table responsive>
                                    <thead>
                                        <tr>
                                            <th>Grievance ID</th>
                                            <th>Title</th>
                                            <th>Department</th>
                                            <th>Status</th>
                                            <th>Priority</th>
                                            <th>Assigned Official</th>
                                            <th>Created At</th>
                                            <th>Escalated At</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {escalatedGrievances.map((grievance) => (
                                            <tr key={grievance._id}>
                                                <td>{grievance.petitionId || grievance.grievanceId || 'N/A'}</td>
                                                <td>{grievance.title}</td>
                                                <td>{grievance.department}</td>
                                                <td>
                                                    <Badge bg={grievance.status === 'Resolved' ? 'success' : 'warning'}>
                                                        {grievance.status}
                                                    </Badge>
                                                </td>
                                                <td>
                                                    <Badge bg={grievance.priority === 'High' ? 'danger' : 'warning'}>
                                                        {grievance.priority}
                                                    </Badge>
                                                </td>
                                                <td>
                                                    {grievance.assignedTo ?
                                                        `${grievance.assignedTo.firstName || ''} ${grievance.assignedTo.lastName || ''}`.trim() || 'Unnamed'
                                                        : 'Unassigned'
                                                    }
                                                </td>
                                                <td>{new Date(grievance.createdAt).toLocaleDateString()}</td>
                                                <td>{new Date(grievance.escalatedAt).toLocaleDateString()}</td>
                                                <td>
                                                    <Button
                                                        variant={grievance.escalationResponse ? "success" : "primary"}
                                                        size="sm"
                                                        onClick={() => handleOpenResponseModal(grievance)}
                                                        disabled={grievance.escalationResponse}
                                                    >
                                                        {grievance.escalationResponse ? "Responded" : "Respond"}
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            )}
                        </Card.Body>
                    </Card>
                );
            case 'resource':
                return (
                    <Card className="shadow-sm">
                        <Card.Header>
                            <h5>Resource Management</h5>
                        </Card.Header>
                        <Card.Body>
                            {resourceLoading ? (
                                <div className="text-center py-4">
                                    <Spinner animation="border" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </Spinner>
                                </div>
                            ) : resourceError ? (
                                <div className="alert alert-danger">{resourceError}</div>
                            ) : (
                                <Table responsive>
                                    <thead>
                                        <tr>
                                            <th>Department</th>
                                            <th>Resources</th>
                                            <th>Status</th>
                                            <th>Last Updated</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {resourceData.map((resource) => (
                                            <tr key={resource._id}>
                                                <td>{resource.department}</td>
                                                <td>{resource.resources}</td>
                                                <td>
                                                    <Badge bg={resource.status === 'Active' ? 'success' : 'warning'}>
                                                        {resource.status}
                                                    </Badge>
                                                </td>
                                                <td>{new Date(resource.updatedAt).toLocaleDateString()}</td>
                                                <td>
                                                    <Button variant="primary" size="sm" className="me-2">
                                                        Edit
                                                    </Button>
                                                    <Button variant="danger" size="sm">
                                                        Delete
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            )}
                        </Card.Body>
                    </Card>
                );
            case 'settings':
                return (
                    <Card className="shadow-sm">
                        <Card.Header>
                            <h5>Settings</h5>
                        </Card.Header>
                        <Card.Body>
                            <Form>
                                <Form.Group className="mb-3">
                                    <Form.Label>Email Notifications</Form.Label>
                                    <Form.Check
                                        type="switch"
                                        id="email-notifications"
                                        label="Receive email notifications"
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>System Preferences</Form.Label>
                                    <Form.Check
                                        type="switch"
                                        id="dark-mode"
                                        label="Dark Mode"
                                    />
                                </Form.Group>
                                <Button variant="primary">Save Changes</Button>
                            </Form>
                        </Card.Body>
                    </Card>
                );
            case 'smart-query':
                return <SmartQuery />;
            default:
                return null;
        }
    };

    return (
        <div className="d-flex">
            <AdminSidebar activeTab={activeTab} onTabChange={handleTabChange} />
            <div className="flex-grow-1">
                <NavBar />
                <Container fluid className="py-3">
                    {renderContent()}
                </Container>
            </div>

            {/* Response Modal */}
            <Modal
                show={showResponseModal}
                onHide={() => setShowResponseModal(false)}
                style={{ zIndex: 9999 }}
                dialogClassName="modal-90w"
            >
                <Modal.Header closeButton>
                    <Modal.Title>Respond to Escalation</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedGrievance && (
                        <Form>
                            {/* Grievance Details Section */}
                            <div className="grievance-details mb-4 p-3 bg-light rounded">
                                <h6 className="border-bottom pb-2 mb-3">Grievance Details</h6>
                                <div className="mb-2">
                                    <strong>Grievance ID:</strong> {selectedGrievance.petitionId || 'N/A'}
                                </div>
                                <div className="mb-2">
                                    <strong>Title:</strong> {selectedGrievance.title}
                                </div>
                                <div className="mb-2">
                                    <strong>Description:</strong>
                                    <p className="text-muted mb-2">{selectedGrievance.description}</p>
                                </div>
                                <div className="mb-2">
                                    <strong>Status:</strong>{' '}
                                    <span className={`badge bg-${getStatusBadgeClass(selectedGrievance.status)}`}>
                                        {selectedGrievance.status?.charAt(0).toUpperCase() + selectedGrievance.status?.slice(1)}
                                    </span>
                                </div>
                                <div className="mb-2">
                                    <strong>Priority:</strong>{' '}
                                    <span className={`badge bg-${getPriorityBadgeClass(selectedGrievance.priority)}`}>
                                        {selectedGrievance.priority}
                                    </span>
                                </div>
                                <div className="mb-2">
                                    <strong>Escalation Reason:</strong>
                                    <p className="text-muted mb-0">{selectedGrievance.escalationReason}</p>
                                </div>
                            </div>

                            {/* Response Form Section */}
                            <h6 className="border-bottom pb-2 mb-3">Response Details</h6>
                            <Form.Group className="mb-3">
                                <Form.Label>Department</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={selectedGrievance.department}
                                    disabled
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Reassign to Official ({selectedGrievance.department} Department)</Form.Label>
                                <Form.Select
                                    value={newAssignedTo}
                                    onChange={(e) => setNewAssignedTo(e.target.value)}
                                    required
                                >
                                    <option value="">Select an official</option>
                                    {officials.map((official) => (
                                        <option key={official._id} value={official._id}>
                                            {official.firstName} {official.lastName} - {official.email}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Response</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={4}
                                    value={escalationResponse}
                                    onChange={(e) => setEscalationResponse(e.target.value)}
                                    placeholder="Enter your response to the escalation..."
                                    required
                                />
                            </Form.Group>
                        </Form>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowResponseModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleRespondToEscalation}>
                        Submit Response
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default AdminDashboard;
