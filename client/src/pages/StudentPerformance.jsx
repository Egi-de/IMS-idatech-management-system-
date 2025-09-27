import React, { useState, useEffect, useMemo, useCallback } from "react";
import { AgGridReact } from "ag-grid-react";
import { ClientSideRowModelModule } from "ag-grid-community";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "../components/Card";
import Button from "../components/Button";
import Modal from "../components/Modal";
import Input from "../components/Input";
import Select from "../components/Select";
import { toast } from "react-toastify";
import { getStudents, updateStudent } from "../services/api.js";
import { debounce } from "lodash";

// Default subjects for grade management when no grades exist
const defaultSubjects = [
  "Mathematics",
  "Programming",
  "Database Systems",
  "Web Development",
  "Data Structures",
];
import { Tooltip as ReactTooltip } from "react-tooltip";
import * as XLSX from "xlsx";
import {
  ChartBarIcon,
  AcademicCapIcon,
  TrophyIcon,
  DocumentTextIcon,
  StarIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  PencilIcon,
  UserIcon,
  BookOpenIcon,
  ClipboardDocumentCheckIcon,
  PlusIcon,
  MinusIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
} from "@heroicons/react/24/outline";

// Grading scale constants
const GRADING_SCALE = {
  A: { min: 90, max: 100, gpa: 4.0 },
  B: { min: 80, max: 89, gpa: 3.0 },
  C: { min: 70, max: 79, gpa: 2.0 },
  D: { min: 60, max: 69, gpa: 1.0 },
  F: { min: 0, max: 59, gpa: 0.0 },
};

// Standing logic
const getStanding = (gpa, assignmentsPercent) => {
  if (gpa >= 2.0 && assignmentsPercent >= 60) return "Good Standing";
  if (gpa < 2.0 || assignmentsPercent < 50) return "Academic Probation";
  return "At Risk";
};

// Calculate grade from marks
const getGrade = (marks) => {
  const avg =
    marks.length > 0 ? marks.reduce((a, b) => a + b, 0) / marks.length : 0;
  for (const [grade, range] of Object.entries(GRADING_SCALE)) {
    if (avg >= range.min && avg <= range.max) return grade;
  }
  return "F";
};

// Calculate GPA from grade
const getGPA = (grade) => GRADING_SCALE[grade]?.gpa || 0;

const ProgressBar = ({ done, total }) => {
  const percentage = total > 0 ? (done / total) * 100 : 0;
  let colorClass = "bg-red-500";
  if (percentage >= 80) colorClass = "bg-green-500";
  else if (percentage >= 60) colorClass = "bg-yellow-500";
  else if (percentage >= 40) colorClass = "bg-orange-500";

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium">
        {done}/{total}
      </span>
      <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-300 rounded-full ${colorClass}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-xs text-gray-600">{percentage.toFixed(1)}%</span>
    </div>
  );
};

// Custom renderer for progress (for AG Grid cellRenderer)
const ProgressCellRenderer = (params) => {
  const assignments = params.data.assignments || { completed: 0, total: 0 };
  return <ProgressBar done={assignments.completed} total={assignments.total} />;
};

// Grade Badge component
const GradeBadge = ({ grade }) => {
  let className = "px-2 py-1 text-xs rounded-full font-medium border";
  let textColor = "text-gray-800";
  if (grade === "A") {
    className += " bg-green-100 border-green-200";
    textColor = "text-green-800";
  } else if (grade === "B") {
    className += " bg-blue-100 border-blue-200";
    textColor = "text-blue-800";
  } else if (grade === "C") {
    className += " bg-yellow-100 border-yellow-200";
    textColor = "text-yellow-800";
  } else if (grade === "D") {
    className += " bg-orange-100 border-orange-200";
    textColor = "text-orange-800";
  } else {
    className += " bg-red-100 border-red-200";
    textColor = "text-red-800";
  }
  return <span className={`${className} ${textColor}`}>{grade}</span>;
};

// Standing Badge component
const StandingBadge = ({ standing }) => {
  let className = "px-2 py-1 text-xs rounded-full font-medium border";
  let textColor = "text-gray-800";
  if (standing === "Good Standing") {
    className += " bg-green-100 border-green-200";
    textColor = "text-green-800";
  } else if (standing === "At Risk") {
    className += " bg-yellow-100 border-yellow-200";
    textColor = "text-yellow-800";
  } else {
    className += " bg-red-100 border-red-200";
    textColor = "text-red-800";
  }
  return <span className={`${className} ${textColor}`}>{standing}</span>;
};

// Colored Grade Renderer for subject cells
const ColoredGradeRenderer = (params) => {
  const value = params.value || 0;
  let bgClass = "bg-red-100 border-red-200";
  let textClass = "text-red-800";
  if (value >= 90) {
    bgClass = "bg-green-100 border-green-200";
    textClass = "text-green-800";
  } else if (value >= 80) {
    bgClass = "bg-blue-100 border-blue-200";
    textClass = "text-blue-800";
  } else if (value >= 70) {
    bgClass = "bg-yellow-100 border-yellow-200";
    textClass = "text-yellow-800";
  } else if (value >= 60) {
    bgClass = "bg-orange-100 border-orange-200";
    textClass = "text-orange-800";
  }
  return (
    <div
      className={`w-full h-full flex items-center justify-center p-2 ${bgClass}`}
    >
      <span className={`font-bold text-lg ${textClass}`}>{value}</span>
    </div>
  );
};

// Custom cell renderer for marks
const MarksCellRenderer = (params) => {
  const marks = params.value || {};
  const subjects = Object.keys(marks);
  return (
    <div className="space-y-1">
      {subjects.map((subject) => (
        <div key={subject} className="text-xs">
          {subject}: {marks[subject]}
        </div>
      ))}
    </div>
  );
};

// Custom cell renderer for mini chart
const ChartCellRenderer = (params) => {
  const data = params.value || [];
  return (
    <ResponsiveContainer width="100%" height={40}>
      <LineChart data={data}>
        <Line
          type="monotone"
          dataKey="gpa"
          stroke="#3b82f6"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

const StudentPerformance = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showGradeManagementModal, setShowGradeManagementModal] =
    useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [gridApi, setGridApi] = useState(null);
  const [gradeManagementGridApi, setGradeManagementGridApi] = useState(null);

  const [filterStatus, setFilterStatus] = useState("All");
  const [filterGPA, setFilterGPA] = useState("");
  const [filterCompletion, setFilterCompletion] = useState("All");

  // Custom modal state for enhanced grade management
  const [subjects, setSubjects] = useState(defaultSubjects);
  const [selectedColumn, setSelectedColumn] = useState(null);
  const [showAddColumnModal, setShowAddColumnModal] = useState(false);
  const [showEditColumnModal, setShowEditColumnModal] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState("");
  const [newSubjectCode, setNewSubjectCode] = useState("");
  const [editSubjectName, setEditSubjectName] = useState("");
  const [editSubjectCode, setEditSubjectCode] = useState("");
  const [modalSearchQuery, setModalSearchQuery] = useState("");
  const [modalFilterStatus, setModalFilterStatus] = useState("All");
  const [modalFilterGPA, setModalFilterGPA] = useState("");

  // Inner save function
  const saveStudent = useCallback(async (studentId, updates) => {
    try {
      await updateStudent(studentId, updates);
      toast.success("Student updated successfully!");
    } catch (err) {
      toast.error("Failed to update student.");
      console.error(err);
    }
  }, []);

  // Debounced save function
  const debouncedSave = useMemo(
    () => debounce(saveStudent, 800),
    [saveStudent]
  );

  // Calculate overall mark and derived fields
  const calculateDerivedFields = useCallback((student) => {
    const marks = Object.values(student.grades || {});
    const overallMark =
      marks.length > 0 ? marks.reduce((a, b) => a + b, 0) / marks.length : 0;
    const grade = getGrade(marks);
    const gpa = getGPA(grade);
    const assignmentsPercent =
      student.assignments?.total > 0
        ? (student.assignments.completed / student.assignments.total) * 100
        : 0;
    const projectsPercent =
      student.projects?.total > 0
        ? (student.projects.completed / student.projects.total) * 100
        : 0;
    const standing = getStanding(gpa, assignmentsPercent);

    return {
      ...student,
      overallMark: overallMark.toFixed(1),
      grade,
      gpa,
      assignmentsPercent: assignmentsPercent.toFixed(1),
      projectsPercent: projectsPercent.toFixed(1),
      standing,
      // Mock trend data for chart
      trendData: [
        { month: "Jan", gpa: student.gpa - 0.2 },
        { month: "Feb", gpa: student.gpa - 0.1 },
        { month: "Mar", gpa: student.gpa },
      ],
    };
  }, []);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getStudents();
        let mappedStudents = response.data.map((student) => ({
          id: student.id,
          studentName: student.name,
          studentId: student.idNumber || "N/A",
          email: student.email,
          program: student.program,
          currentGPA: parseFloat(student.gpa) || 0,
          cumulativeGPA:
            parseFloat(student.cumulative_gpa) || parseFloat(student.gpa) || 0,
          totalCredits: student.credits || 0,
          completedCredits: student.completed_credits || 0,
          currentSemester: student.current_semester || "Spring 2024",
          grades: student.grades || {},
          assignments: student.assignments || {
            completed: 0,
            total: 0,
            averageScore: 0,
          },
          projects: {
            completed: student.projects ? student.projects.length : 0,
            total: student.projects ? student.projects.length : 0,
            averageGrade:
              student.projects && student.projects.length > 0 ? "B" : "B",
          },
          attendance: student.attendance || 0,
          participation: student.performance || "Average",
        }));

        // Calculate derived fields
        mappedStudents = mappedStudents.map(calculateDerivedFields);

        // Fallback mock data if no students
        if (mappedStudents.length === 0) {
          mappedStudents = [
            {
              id: 1,
              studentName: "John Doe",
              studentId: "STU001",
              email: "john@example.com",
              program: "Software Development",
              currentGPA: 3.7,
              cumulativeGPA: 3.6,
              totalCredits: 120,
              completedCredits: 90,
              currentSemester: "Fall 2024",
              grades: { Mathematics: 92, Programming: 85 },
              assignments: { completed: 2, total: 3, averageScore: 88 },
              projects: { completed: 5, total: 6, averageGrade: "A-" },
              attendance: 95,
              participation: "Excellent",
            },
            {
              id: 2,
              studentName: "Jane Smith",
              studentId: "STU002",
              email: "jane@example.com",
              program: "Data Science",
              currentGPA: 2.8,
              cumulativeGPA: 3.0,
              totalCredits: 120,
              completedCredits: 75,
              currentSemester: "Fall 2024",
              grades: { "Database Systems": 78, Programming: 72 },
              assignments: { completed: 1, total: 3, averageScore: 75 },
              projects: { completed: 3, total: 6, averageGrade: "B" },
              attendance: 85,
              participation: "Good",
            },
          ].map(calculateDerivedFields);
          console.log("Using mock data for demo");
        }
        setStudents(mappedStudents);
      } catch (err) {
        setError("Failed to fetch students. Please try again.");
        toast.error("Failed to fetch students.");
        console.error(err);
        // Fallback to mock data on error to ensure modal renders
        const mockStudents = [
          {
            id: 1,
            studentName: "John Doe",
            studentId: "STU001",
            email: "john@example.com",
            program: "Software Development",
            currentGPA: 3.7,
            cumulativeGPA: 3.6,
            totalCredits: 120,
            completedCredits: 90,
            currentSemester: "Fall 2024",
            grades: { Mathematics: 92, Programming: 85 },
            assignments: { completed: 2, total: 3, averageScore: 88 },
            projects: { completed: 5, total: 6, averageGrade: "A-" },
            attendance: 95,
            participation: "Excellent",
          },
          {
            id: 2,
            studentName: "Jane Smith",
            studentId: "STU002",
            email: "jane@example.com",
            program: "Data Science",
            currentGPA: 2.8,
            cumulativeGPA: 3.0,
            totalCredits: 120,
            completedCredits: 75,
            currentSemester: "Fall 2024",
            grades: { "Database Systems": 78, Programming: 72 },
            assignments: { completed: 1, total: 3, averageScore: 75 },
            projects: { completed: 3, total: 6, averageGrade: "B" },
            attendance: 85,
            participation: "Good",
          },
        ].map(calculateDerivedFields);
        setStudents(mockStudents);
        console.log("Using mock data due to API error");
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [calculateDerivedFields]);

  // AG Grid column definitions
  const columnDefs = useMemo(
    () => [
      {
        headerName: "Name",
        field: "studentName",
        pinned: "left",
        width: 150,
        cellRenderer: (params) => (
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
              <AcademicCapIcon className="h-4 w-4 text-blue-600" />
            </div>
            <span>{params.value}</span>
          </div>
        ),
      },
      { headerName: "Student ID", field: "studentId", width: 120 },
      {
        headerName: "Assignments",
        field: "assignmentsPercent",
        width: 150,
        cellRenderer: ProgressCellRenderer,
        editable: true,
        cellEditor: "agTextCellEditor",
        valueSetter: (params) => {
          const value = parseFloat(params.newValue);
          if (isNaN(value) || value < 0 || value > 100) {
            toast.error("Invalid percentage. Must be 0-100.");
            return false;
          }
          params.data.assignmentsPercent = value;
          return true;
        },
      },
      {
        headerName: "Marks",
        field: "grades",
        width: 200,
        cellRenderer: MarksCellRenderer,
        editable: false,
      },
      {
        headerName: "Overall Mark",
        field: "overallMark",
        width: 120,
        editable: false,
      },
      {
        headerName: "Grade",
        field: "grade",
        width: 80,
        editable: false,
        cellStyle: (params) => ({
          backgroundColor:
            getGradeColor(params.value).split(" ")[1] || "#f3f4f6",
        }),
      },
      {
        headerName: "GPA",
        field: "gpa",
        width: 80,
        editable: false,
      },
      {
        headerName: "Standing",
        field: "standing",
        width: 140,
        editable: false,
        cellStyle: (params) => ({
          backgroundColor:
            getStandingColor(params.value).split(" ")[1] || "#f3f4f6",
        }),
      },
      {
        headerName: "Trend",
        field: "trendData",
        width: 100,
        cellRenderer: ChartCellRenderer,
      },
      {
        headerName: "Actions",
        field: "actions",
        width: 100,
        cellRenderer: (params) => (
          <Button
            variant="outline"
            size="small"
            onClick={() => handleViewDetails(params.data)}
          >
            <EyeIcon className="h-4 w-4" />
          </Button>
        ),
      },
    ],
    []
  );

  // Filtered students based on search and filters
  const filteredStudents = useMemo(() => {
    let filtered = students;

    if (searchQuery) {
      filtered = filtered.filter(
        (student) =>
          student.studentName
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          student.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
          student.program.toLowerCase().includes(searchQuery.toLowerCase()) ||
          student.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterStatus !== "All") {
      filtered = filtered.filter(
        (student) => student.standing === filterStatus
      );
    }

    if (filterGPA) {
      const [min, max] = filterGPA.split("-").map(Number);
      filtered = filtered.filter(
        (student) => student.gpa >= min && student.gpa <= max
      );
    }

    if (filterCompletion !== "All") {
      filtered = filtered.filter((student) => {
        const percent = parseFloat(student.assignmentsPercent);
        if (filterCompletion === "High") return percent >= 80;
        if (filterCompletion === "Medium") return percent >= 60 && percent < 80;
        if (filterCompletion === "Low") return percent < 60;
        return true;
      });
    }

    return filtered;
  }, [students, searchQuery, filterStatus, filterGPA, filterCompletion]);

  // Filtered students for modal
  const modalFilteredStudents = useMemo(() => {
    let filtered = students;

    if (modalSearchQuery) {
      filtered = filtered.filter(
        (student) =>
          student.studentName
            .toLowerCase()
            .includes(modalSearchQuery.toLowerCase()) ||
          student.studentId
            .toLowerCase()
            .includes(modalSearchQuery.toLowerCase()) ||
          student.program
            .toLowerCase()
            .includes(modalSearchQuery.toLowerCase()) ||
          student.email.toLowerCase().includes(modalSearchQuery.toLowerCase())
      );
    }

    if (modalFilterStatus !== "All") {
      filtered = filtered.filter(
        (student) => student.standing === modalFilterStatus
      );
    }

    if (modalFilterGPA) {
      const [min, max] = modalFilterGPA.split("-").map(Number);
      filtered = filtered.filter(
        (student) => student.gpa >= min && student.gpa <= max
      );
    }

    return filtered;
  }, [students, modalSearchQuery, modalFilterStatus, modalFilterGPA]);

  // Initialize subjects from data on load
  useEffect(() => {
    if (students.length > 0) {
      const subjectSet = new Set();
      students.forEach((student) => {
        Object.keys(student.grades || {}).forEach((subject) =>
          subjectSet.add(subject)
        );
      });
      const subjectList = Array.from(subjectSet);
      if (subjectList.length === 0) {
        setSubjects(defaultSubjects);
      } else {
        setSubjects(subjectList);
      }
    }
  }, [students]);

  // Grade management column definitions
  const gradeManagementColumnDefs = useMemo(() => {
    const cols = [
      { headerName: "Name", field: "studentName", width: 150 },
      { headerName: "Student ID", field: "studentId", width: 120 },
      {
        headerName: "Assignments",
        field: "assignments.completed",
        width: 150,
        editable: true,
        cellEditor: "agNumberCellEditor",
        cellRenderer: (params) => {
          const a = params.data.assignments || { completed: 0, total: 0 };
          const percent = params.data.assignmentsPercent || 0;
          return `${a.completed}/${a.total} (${percent}%)`;
        },
        valueParser: (params) => parseInt(params.newValue) || 0,
        valueSetter: (params) => {
          const value = parseInt(params.newValue);
          const total = (params.data.assignments || {}).total || 0;
          if (isNaN(value) || value < 0 || value > total) {
            toast.error(
              `Completed assignments must be between 0 and ${total}.`
            );
            return false;
          }
          if (!params.data.assignments)
            params.data.assignments = { completed: 0, total: 0 };
          params.data.assignments.completed = value;
          return true;
        },
      },
      {
        headerName: "Projects",
        field: "projects.completed",
        width: 150,
        editable: true,
        cellEditor: "agNumberCellEditor",
        cellRenderer: (params) => {
          const p = params.data.projects || { completed: 0, total: 0 };
          const percent = params.data.projectsPercent || 0;
          return `${p.completed}/${p.total} (${percent}%)`;
        },
        valueParser: (params) => parseInt(params.newValue) || 0,
        valueSetter: (params) => {
          const value = parseInt(params.newValue);
          const total = (params.data.projects || {}).total || 0;
          if (isNaN(value) || value < 0 || value > total) {
            toast.error(`Completed projects must be between 0 and ${total}.`);
            return false;
          }
          if (!params.data.projects)
            params.data.projects = { completed: 0, total: 0 };
          params.data.projects.completed = value;
          return true;
        },
      },
    ];
    const subjectCols = subjects.map((subject) => ({
      colId: subject,
      headerName: subject,
      width: 100,
      editable: true,
      cellEditor: "agNumberCellEditor",
      cellRenderer: ColoredGradeRenderer,
      headerClass: (params) =>
        selectedColumn === params.column.getColId() ? "bg-blue-100" : "",
      valueGetter: (params) => params.data.grades?.[subject] || 0,
      valueParser: (params) => parseFloat(params.newValue) || 0,
      valueSetter: (params) => {
        const value = parseFloat(params.newValue);
        if (isNaN(value) || value < 0 || value > 100) {
          toast.error("Invalid mark. Must be 0-100.");
          return false;
        }
        if (!params.data.grades) params.data.grades = {};
        params.data.grades[subject] = value;
        // Recalculate derived fields immediately
        const updatedData = calculateDerivedFields(params.data);
        Object.assign(params.data, updatedData);
        if (gradeManagementGridApi) {
          gradeManagementGridApi.refreshCells({
            rowNodes: [params.node],
            force: true,
          });
        }
        return true;
      },
    }));
    const derivedCols = [
      { headerName: "Overall Mark", field: "overallMark", width: 120 },
      { headerName: "Grade", field: "grade", width: 80 },
      { headerName: "GPA", field: "gpa", width: 80 },
      { headerName: "Standing", field: "standing", width: 140 },
    ];
    const fullCols = [...cols, ...subjectCols, ...derivedCols];
    console.log("Grade Management ColumnDefs length:", fullCols.length);
    console.log("First few columns:", fullCols.slice(0, 3));
    return fullCols;
  }, [
    subjects,
    selectedColumn,
    gradeManagementGridApi,
    calculateDerivedFields,
  ]);

  // Handle grade management cell value changes
  const onGradeManagementCellValueChanged = (params) => {
    const { data, colDef } = params;
    if (
      colDef.field === "assignments.completed" ||
      colDef.field === "projects.completed" ||
      !colDef.field // for subject columns without field
    ) {
      // Recalculate derived fields
      const updatedData = calculateDerivedFields(data);
      Object.assign(data, updatedData);
      // Update grid
      if (gradeManagementGridApi) {
        gradeManagementGridApi.refreshCells({
          rowNodes: [params.node],
          force: true,
        });
      }
      // Update state to trigger re-render
      setStudents((prev) => [...prev]);
      // Debounced save
      debouncedSave(data.id, {
        assignments: data.assignments,
        projects: data.projects,
        grades: data.grades,
      });
    }
  };

  // Batch save function for Save Changes button
  const handleBatchSave = async () => {
    try {
      setLoading(true);
      const savePromises = students.map((student) =>
        updateStudent(student.id, {
          assignments: student.assignments,
          projects: student.projects,
          grades: student.grades,
        }).catch((err) => {
          console.error(`Failed to save for student ${student.id}:`, err);
          return null;
        })
      );
      const results = await Promise.allSettled(savePromises);
      const successCount = results.filter(
        (r) => r.status === "fulfilled"
      ).length;
      toast.success(`Saved changes for ${successCount} students.`);
    } catch (err) {
      toast.error("Failed to save changes.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Summary statistics
  const summaryStats = useMemo(() => {
    const total = filteredStudents.length;
    const avgGPA =
      total > 0
        ? filteredStudents.reduce((sum, s) => sum + s.gpa, 0) / total
        : 0;
    const medianGPA =
      total > 0
        ? [...filteredStudents].sort((a, b) => a.gpa - b.gpa)[
            Math.floor(total / 2)
          ]?.gpa || 0
        : 0;
    const avgAssignments =
      total > 0
        ? filteredStudents.reduce(
            (sum, s) => sum + parseFloat(s.assignmentsPercent),
            0
          ) / total
        : 0;
    const avgProjects =
      total > 0
        ? filteredStudents.reduce(
            (sum, s) => sum + parseFloat(s.projectsPercent),
            0
          ) / total
        : 0;
    const highestGPA = Math.max(...filteredStudents.map((s) => s.gpa), 0);
    const lowestGPA = Math.min(...filteredStudents.map((s) => s.gpa), 0);
    const bestCompletion = Math.max(
      ...filteredStudents.map((s) => parseFloat(s.assignmentsPercent)),
      0
    );
    const worstCompletion = Math.min(
      ...filteredStudents.map((s) => parseFloat(s.assignmentsPercent)),
      0
    );

    const standingCounts = filteredStudents.reduce((acc, student) => {
      acc[student.standing] = (acc[student.standing] || 0) + 1;
      return acc;
    }, {});

    return {
      total,
      avgGPA: avgGPA.toFixed(2),
      medianGPA: medianGPA.toFixed(2),
      avgAssignments: avgAssignments.toFixed(1),
      avgProjects: avgProjects.toFixed(1),
      highestGPA: highestGPA.toFixed(2),
      lowestGPA: lowestGPA.toFixed(2),
      bestCompletion: bestCompletion.toFixed(1),
      worstCompletion: worstCompletion.toFixed(1),
      standingCounts,
    };
  }, [filteredStudents]);

  const handleViewDetails = (student) => {
    setSelectedStudent(student);
    setShowModal(true);
  };

  const getGradeColor = (grade) => {
    switch (grade) {
      case "A":
        return "text-green-600 bg-green-100";
      case "B":
        return "text-blue-600 bg-blue-100";
      case "C":
        return "text-yellow-600 bg-yellow-100";
      case "D":
        return "text-orange-600 bg-orange-100";
      case "F":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getStandingColor = (standing) => {
    switch (standing) {
      case "Good Standing":
        return "text-green-600 bg-green-100";
      case "At Risk":
        return "text-yellow-600 bg-yellow-100";
      case "Academic Probation":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  // Import Excel function
  const handleImportSubmit = async () => {
    if (!selectedFile) {
      toast.error("Please select a file.");
      return;
    }

    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      if (jsonData.length < 2) {
        toast.error("Excel file is empty or invalid.");
        return;
      }

      const headers = jsonData[0];
      const studentIdIndex = headers.indexOf("Student ID");
      if (studentIdIndex === -1) {
        toast.error("Excel file must have 'Student ID' column.");
        return;
      }

      const updates = [];
      for (let i = 1; i < jsonData.length; i++) {
        const row = jsonData[i];
        if (row.length === 0 || !row[studentIdIndex]) continue;

        const studentId = row[studentIdIndex];
        const grades = {};
        headers.forEach((header, index) => {
          if (
            index !== studentIdIndex &&
            header &&
            row[index] !== undefined &&
            row[index] !== null
          ) {
            const mark = parseFloat(row[index]);
            if (!isNaN(mark)) {
              grades[header] = mark;
            }
          }
        });

        if (Object.keys(grades).length > 0) {
          updates.push({ studentId, grades });
        }
      }

      if (updates.length === 0) {
        toast.error("No valid data found in the file.");
        return;
      }

      // Update students
      for (const update of updates) {
        const student = students.find((s) => s.studentId === update.studentId);
        if (student) {
          const updatedGrades = { ...student.grades, ...update.grades };
          await updateStudent(student.id, { grades: updatedGrades });
          // Update local state
          setStudents((prev) =>
            prev.map((s) =>
              s.id === student.id
                ? calculateDerivedFields({ ...s, grades: updatedGrades })
                : s
            )
          );
        }
      }

      toast.success(
        `Successfully imported marks for ${updates.length} students.`
      );
      setShowImportModal(false);
      setSelectedFile(null);
      if (gridApi) gridApi.refreshCells();
    } catch (err) {
      toast.error("Failed to import file. Please check the format.");
      console.error(err);
    }
  };

  // Handle cell value changes
  const onCellValueChanged = (params) => {
    const { data, colDef, newValue } = params;
    if (colDef.field === "assignmentsPercent") {
      // Recalculate standing
      const assignmentsPercent = parseFloat(newValue);
      data.standing = getStanding(data.gpa, assignmentsPercent);

      // Update grid
      gridApi.refreshCells({ rowNodes: [params.node], force: true });

      // Debounced save
      debouncedSave(data.id, {
        assignments: {
          ...data.assignments,
          completed: Math.round(
            (assignmentsPercent / 100) * data.assignments.total
          ),
        },
      });
    }
  };

  // Export functions
  const exportToCSV = useCallback(() => {
    if (filteredStudents.length === 0) {
      toast.warning("No data to export.");
      return;
    }
    const headers = columnDefs.map((col) => col.headerName).join(",");
    const rows = filteredStudents.map((student) =>
      columnDefs
        .map((col) => {
          if (col.field === "grades") return JSON.stringify(student.grades);
          if (col.field === "trendData") return ""; // Skip complex data
          if (col.cellRenderer) return ""; // Skip rendered columns
          return student[col.field] || "";
        })
        .join(",")
    );
    const csvContent = [headers, ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "student_performance.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV exported successfully!");
  }, [filteredStudents, columnDefs]);

  const exportToExcel = useCallback(() => {
    if (filteredStudents.length === 0) {
      toast.warning("No data to export.");
      return;
    }
    const wsData = [
      columnDefs.map((col) => col.headerName),
      ...filteredStudents.map((student) =>
        columnDefs.map((col) => {
          if (col.field === "grades") return JSON.stringify(student.grades);
          if (col.field === "trendData") return "";
          if (col.cellRenderer) return "";
          return student[col.field] || "";
        })
      ),
    ];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Students");
    XLSX.writeFile(wb, "student_performance.xlsx");
    toast.success("Excel exported successfully!");
  }, [filteredStudents, columnDefs]);

  return (
    <div className="space-y-6">
      <ReactTooltip />

      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Performance & Grades
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track student academic performance and grades
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={() => setShowGradeManagementModal(true)}
            variant="outline"
          >
            <PencilIcon className="h-4 w-4 mr-2" />
            Record Student Marks
          </Button>
          <Button onClick={() => setShowReportModal(true)} variant="outline">
            <DocumentTextIcon className="h-4 w-4 mr-2" />
            Generate Student Report
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {summaryStats.total}
              </div>
              <div className="text-sm text-gray-600">Total Students</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {summaryStats.avgGPA}
              </div>
              <div className="text-sm text-gray-600">Average GPA</div>
              <div className="text-xs text-gray-500">
                Median: {summaryStats.medianGPA}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                {summaryStats.avgAssignments}%
              </div>
              <div className="text-sm text-gray-600">
                Assignments Completion
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">
                {summaryStats.avgProjects}%
              </div>
              <div className="text-sm text-gray-600">Projects Completion</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold text-indigo-600">
                {summaryStats.standingCounts["Good Standing"] || 0} 🟢
                <br />
                {summaryStats.standingCounts["At Risk"] || 0} 🟡
                <br />
                {summaryStats.standingCounts["Academic Probation"] || 0} 🔴
              </div>
              <div className="text-sm text-gray-600">Standing Breakdown</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
        <div>
          Highest GPA:{" "}
          <span className="font-semibold">{summaryStats.highestGPA}</span>
        </div>
        <div>
          Lowest GPA:{" "}
          <span className="font-semibold">{summaryStats.lowestGPA}</span>
        </div>
        <div>
          Best Completion:{" "}
          <span className="font-semibold">{summaryStats.bestCompletion}%</span>
        </div>
        <div>
          Worst Completion:{" "}
          <span className="font-semibold">{summaryStats.worstCompletion}%</span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-64">
          <div className="relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search students..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="All">All Standing</option>
          <option value="Good Standing">Good Standing</option>
          <option value="At Risk">At Risk</option>
          <option value="Academic Probation">Academic Probation</option>
        </select>

        <select
          value={filterGPA}
          onChange={(e) => setFilterGPA(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All GPA Ranges</option>
          <option value="3.5-4.0">3.5 - 4.0</option>
          <option value="3.0-3.4">3.0 - 3.4</option>
          <option value="2.5-2.9">2.5 - 2.9</option>
          <option value="2.0-2.4">2.0 - 2.4</option>
          <option value="0-1.9">Below 2.0</option>
        </select>

        <select
          value={filterCompletion}
          onChange={(e) => setFilterCompletion(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="All">All Completion Rates</option>
          <option value="High">High (80%+)</option>
          <option value="Medium">Medium (60-79%)</option>
          <option value="Low">Low {"<60%"}</option>
        </select>
      </div>

      {/* AG Grid */}
      {loading ? (
        <Card>
          <CardContent className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">
              Loading student performance data...
            </p>
          </CardContent>
        </Card>
      ) : error ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-red-600 mb-2">{error}</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="ag-theme-alpine" style={{ height: 600, width: "100%" }}>
          <AgGridReact
            rowData={filteredStudents}
            columnDefs={columnDefs}
            modules={[ClientSideRowModelModule]}
            onGridReady={(params) => {
              setGridApi(params.api);
            }}
            onCellValueChanged={onCellValueChanged}
            defaultColDef={{
              resizable: true,
              sortable: true,
              filter: true,
            }}
            getRowStyle={(params) => ({
              backgroundColor:
                getStandingColor(params.data.standing).split(" ")[1] ||
                "#ffffff",
            })}
            pagination={true}
            paginationPageSize={20}
          />
        </div>
      )}

      {/* Performance Details Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Performance Details"
        size="large"
      >
        {selectedStudent && (
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center">
                <AcademicCapIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">
                  {selectedStudent.studentName}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {selectedStudent.email}
                </p>
                <p className="text-sm text-gray-500">
                  ID: {selectedStudent.studentId}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Academic Summary
                  </label>
                  <div className="mt-2 grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <div
                        className={`text-2xl font-bold ${
                          getGradeColor(selectedStudent.grade).split(" ")[0]
                        }`}
                      >
                        {selectedStudent.grade}
                      </div>
                      <div className="text-sm text-blue-600">Grade</div>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg">
                      <div
                        className={`text-2xl font-bold ${
                          getGradeColor(selectedStudent.grade).split(" ")[0]
                        }`}
                      >
                        {selectedStudent.gpa}
                      </div>
                      <div className="text-sm text-green-600">GPA</div>
                    </div>
                    <div className="bg-purple-50 p-3 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {selectedStudent.overallMark}%
                      </div>
                      <div className="text-sm text-purple-600">
                        Overall Mark
                      </div>
                    </div>
                    <div className="bg-yellow-50 p-3 rounded-lg">
                      <div
                        className={`px-2 py-1 rounded-full text-sm font-medium ${getStandingColor(
                          selectedStudent.standing
                        )}`}
                      >
                        {selectedStudent.standing}
                      </div>
                      <div className="text-sm text-yellow-600">Standing</div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Course Grades
                  </label>
                  <div className="mt-2 space-y-2">
                    {Object.entries(selectedStudent.grades).map(
                      ([course, grade]) => (
                        <div
                          key={course}
                          className="flex justify-between items-center p-2 bg-gray-50 rounded"
                        >
                          <span className="text-sm font-medium">{course}</span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getGradeColor(
                              getGrade([grade])
                            )}`}
                          >
                            {grade}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Assignment Summary
                  </label>
                  <div className="mt-2 space-y-3">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Assignments</span>
                        <span className="text-sm text-gray-600">
                          {selectedStudent.assignments.completed}/
                          {selectedStudent.assignments.total} (
                          {selectedStudent.assignmentsPercent}%)
                        </span>
                      </div>
                      <ProgressBar
                        done={selectedStudent.assignments.completed}
                        total={selectedStudent.assignments.total}
                      />
                      <div className="text-xs text-gray-600 mt-1">
                        Average Score:{" "}
                        {selectedStudent.assignments.averageScore}%
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Performance Trend
                  </label>
                  <div className="mt-2">
                    <ResponsiveContainer width="100%" height={100}>
                      <LineChart data={selectedStudent.trendData}>
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="gpa"
                          stroke="#3b82f6"
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Additional Metrics
                  </label>
                  <div className="mt-2 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Attendance:</span>
                      <span className="text-sm font-medium">
                        {selectedStudent.attendance}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Participation:</span>
                      <span className="text-sm font-medium">
                        {selectedStudent.participation}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Credits:</span>
                      <span className="text-sm font-medium">
                        {selectedStudent.completedCredits}/
                        {selectedStudent.totalCredits}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Import Excel Modal */}
      <Modal
        isOpen={showImportModal}
        onClose={() => {
          setShowImportModal(false);
          setSelectedFile(null);
        }}
        title="Import Marks from Excel"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Upload an Excel file with student marks. The file should have:
            <ul className="list-disc list-inside mt-2 ml-4">
              <li>
                First row: Headers starting with "Student ID" followed by
                subject names
              </li>
              <li>Subsequent rows: Student ID and corresponding marks</li>
            </ul>
          </p>
          <Input
            type="file"
            accept=".xlsx,.xls"
            onChange={(e) => setSelectedFile(e.target.files[0])}
          />
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowImportModal(false);
                setSelectedFile(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleImportSubmit} disabled={!selectedFile}>
              Import
            </Button>
          </div>
        </div>
      </Modal>

      {/* Grade Management Modal */}
      <Modal
        isOpen={showGradeManagementModal}
        onClose={() => setShowGradeManagementModal(false)}
        title="Record Student Marks"
        size="xl"
      >
        <div className="space-y-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading students...</p>
            </div>
          ) : students.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">
                No students available. Please add students first.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {students.length}
                      </div>
                      <div className="text-sm text-gray-600">
                        Total Students
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {students.length > 0
                          ? (
                              students.reduce((sum, s) => sum + s.gpa, 0) /
                              students.length
                            ).toFixed(2)
                          : "0.00"}
                      </div>
                      <div className="text-sm text-gray-600">Average GPA</div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {students.length > 0
                          ? (
                              students.reduce(
                                (sum, s) =>
                                  sum + parseFloat(s.assignmentsPercent),
                                0
                              ) / students.length
                            ).toFixed(1)
                          : "0.0"}
                        %
                      </div>
                      <div className="text-sm text-gray-600">
                        Assignments Completion
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {students.length > 0
                          ? (
                              students.reduce(
                                (sum, s) => sum + parseFloat(s.projectsPercent),
                                0
                              ) / students.length
                            ).toFixed(1)
                          : "0.0"}
                        %
                      </div>
                      <div className="text-sm text-gray-600">
                        Projects Completion
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-indigo-600">
                        {
                          students.filter((s) => s.standing === "Good Standing")
                            .length
                        }{" "}
                        🟢
                        <br />
                        {
                          students.filter((s) => s.standing === "At Risk")
                            .length
                        }{" "}
                        🟡
                        <br />
                        {
                          students.filter(
                            (s) => s.standing === "Academic Probation"
                          ).length
                        }{" "}
                        🔴
                      </div>
                      <div className="text-sm text-gray-600">
                        Standing Breakdown
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Toolbar */}
              <div className="flex flex-wrap gap-4 items-center justify-between bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search students..."
                      value={modalSearchQuery}
                      onChange={(e) => setModalSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <select
                    value={modalFilterStatus}
                    onChange={(e) => setModalFilterStatus(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="All">All Standing</option>
                    <option value="Good Standing">Good Standing</option>
                    <option value="At Risk">At Risk</option>
                    <option value="Academic Probation">
                      Academic Probation
                    </option>
                  </select>

                  <select
                    value={modalFilterGPA}
                    onChange={(e) => setModalFilterGPA(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All GPA Ranges</option>
                    <option value="3.5-4.0">3.5 - 4.0</option>
                    <option value="3.0-3.4">3.0 - 3.4</option>
                    <option value="2.5-2.9">2.5 - 2.9</option>
                    <option value="2.0-2.4">2.0 - 2.4</option>
                    <option value="0-1.9">Below 2.0</option>
                  </select>
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    onClick={() => setShowAddColumnModal(true)}
                    variant="outline"
                    size="sm"
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Add Subject
                  </Button>
                  <Button
                    onClick={() => {
                      if (selectedColumn) {
                        // Pre-fill edit modal with current subject details
                        const [name, code] = selectedColumn.includes("(")
                          ? [
                              selectedColumn.split(" (")[0],
                              selectedColumn.match(/\(([^)]+)\)/)?.[1] || "",
                            ]
                          : [selectedColumn, ""];
                        setEditSubjectName(name);
                        setEditSubjectCode(code);
                        setShowEditColumnModal(true);
                      } else {
                        toast.warning(
                          "Please select a subject column first by clicking its header."
                        );
                      }
                    }}
                    variant="outline"
                    size="sm"
                  >
                    <PencilIcon className="h-4 w-4 mr-2" />
                    Edit Subject
                  </Button>
                  <Button
                    onClick={() => {
                      if (selectedColumn) {
                        if (
                          window.confirm(
                            `Delete subject "${selectedColumn}"? This will remove all marks for this subject.`
                          )
                        ) {
                          const updatedSubjects = subjects.filter(
                            (subject) => subject !== selectedColumn
                          );
                          setSubjects(updatedSubjects);

                          // Remove grades for this subject from all students
                          const updatedStudents = students.map((student) => {
                            if (
                              student.grades &&
                              student.grades[selectedColumn] !== undefined
                            ) {
                              const newGrades = { ...student.grades };
                              delete newGrades[selectedColumn];
                              // Recalculate derived fields
                              return calculateDerivedFields({
                                ...student,
                                grades: newGrades,
                              });
                            }
                            return student;
                          });
                          setStudents(updatedStudents);

                          setSelectedColumn(null);
                          if (gradeManagementGridApi) {
                            gradeManagementGridApi.refreshCells({
                              force: true,
                            });
                          }
                          toast.success("Subject deleted successfully.");
                        }
                      } else {
                        toast.warning(
                          "Please select a subject column first by clicking its header."
                        );
                      }
                    }}
                    variant="outline"
                    size="sm"
                  >
                    <MinusIcon className="h-4 w-4 mr-2" />
                    Delete Subject
                  </Button>
                  <Button
                    onClick={handleBatchSave}
                    variant="primary"
                    size="sm"
                    disabled={loading}
                  >
                    <ArrowUpTrayIcon className="h-4 w-4 mr-2" />
                    {loading ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </div>

              {/* AG Grid */}
              <div
                className="ag-theme-alpine border rounded-lg"
                style={{ height: 500, width: "100%" }}
              >
                <AgGridReact
                  rowData={modalFilteredStudents}
                  columnDefs={gradeManagementColumnDefs}
                  modules={[ClientSideRowModelModule]}
                  onGridReady={(params) => {
                    setGradeManagementGridApi(params.api);
                    console.log(
                      "Grade Management Grid Ready - Row Count:",
                      params.api.getDisplayedRowCount()
                    );
                  }}
                  onHeaderClicked={(params) => {
                    const colId = params.column.getColId();
                    if (subjects.includes(colId)) {
                      setSelectedColumn(
                        colId === selectedColumn ? null : colId
                      );
                    }
                  }}
                  onCellValueChanged={onGradeManagementCellValueChanged}
                  defaultColDef={{
                    resizable: true,
                    sortable: true,
                    filter: true,
                  }}
                  getRowStyle={(params) => ({
                    backgroundColor:
                      getStandingColor(params.data.standing).split(" ")[1] ||
                      "#ffffff",
                  })}
                  pagination={true}
                  paginationPageSize={Math.min(
                    20,
                    modalFilteredStudents.length
                  )}
                  suppressNoRowsOverlay={false}
                  enableRangeSelection={true}
                  enableFillHandle={true}
                  allowContextMenuWithControlKey={true}
                />
              </div>
            </div>
          )}

          {/* Modal Footer */}
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setShowGradeManagementModal(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                setShowGradeManagementModal(false);
                toast.success("Changes have been saved automatically.");
              }}
            >
              Close
            </Button>
          </div>
        </div>
      </Modal>

      {/* Report Modal */}
      <Modal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        title="Generate Student Report"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Export student performance data in various formats.
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            <Button onClick={exportToCSV}>
              <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button onClick={exportToExcel}>
              <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
              Export Excel
            </Button>
            <Button
              onClick={() => toast.info("PDF generation coming soon.")}
              variant="outline"
            >
              <DocumentTextIcon className="h-4 w-4 mr-2" />
              Generate PDF
            </Button>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowReportModal(false)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>

      {/* Add Subject Modal */}
      <Modal
        isOpen={showAddColumnModal}
        onClose={() => {
          setShowAddColumnModal(false);
          setNewSubjectName("");
          setNewSubjectCode("");
        }}
        title="Add New Subject"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Subject Name
            </label>
            <Input
              type="text"
              value={newSubjectName}
              onChange={(e) => setNewSubjectName(e.target.value)}
              placeholder="Enter subject name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Subject Code (Optional)
            </label>
            <Input
              type="text"
              value={newSubjectCode}
              onChange={(e) => setNewSubjectCode(e.target.value)}
              placeholder="Enter subject code"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowAddColumnModal(false);
                setNewSubjectName("");
                setNewSubjectCode("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!newSubjectName.trim()) {
                  toast.error("Subject name is required.");
                  return;
                }
                const subjectName = newSubjectCode
                  ? `${newSubjectName} (${newSubjectCode})`
                  : newSubjectName;
                if (subjects.includes(subjectName)) {
                  toast.error("Subject already exists.");
                  return;
                }
                // Add to subjects
                const updatedSubjects = [...subjects, subjectName];
                setSubjects(updatedSubjects);

                // Initialize new subject in all students' grades
                const updatedStudents = students.map((student) => {
                  const newGrades = { ...student.grades, [subjectName]: 0 };
                  return calculateDerivedFields({
                    ...student,
                    grades: newGrades,
                  });
                });
                setStudents(updatedStudents);

                setShowAddColumnModal(false);
                setNewSubjectName("");
                setNewSubjectCode("");
                toast.success(
                  "Subject added successfully. New column created."
                );
                if (gradeManagementGridApi) {
                  gradeManagementGridApi.refreshCells({ force: true });
                }
              }}
              disabled={!newSubjectName.trim()}
            >
              Add Subject
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Subject Modal */}
      <Modal
        isOpen={showEditColumnModal}
        onClose={() => {
          setShowEditColumnModal(false);
          setEditSubjectName("");
          setEditSubjectCode("");
          setSelectedColumn(null);
        }}
        title="Edit Subject"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Subject Name
            </label>
            <Input
              type="text"
              value={editSubjectName}
              onChange={(e) => setEditSubjectName(e.target.value)}
              placeholder="Enter subject name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Subject Code (Optional)
            </label>
            <Input
              type="text"
              value={editSubjectCode}
              onChange={(e) => setEditSubjectCode(e.target.value)}
              placeholder="Enter subject code"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowEditColumnModal(false);
                setEditSubjectName("");
                setEditSubjectCode("");
                setSelectedColumn(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!editSubjectName.trim()) {
                  toast.error("Subject name is required.");
                  return;
                }
                const newSubjectName = editSubjectCode
                  ? `${editSubjectName} (${editSubjectCode})`
                  : editSubjectName;
                if (
                  subjects.includes(newSubjectName) &&
                  newSubjectName !== selectedColumn
                ) {
                  toast.error("Subject already exists.");
                  return;
                }
                const updatedSubjects = subjects.map((subject) =>
                  subject === selectedColumn ? newSubjectName : subject
                );
                setSubjects(updatedSubjects);

                // Update grades in students data
                const updatedStudents = students.map((student) => {
                  if (
                    student.grades &&
                    student.grades[selectedColumn] !== undefined
                  ) {
                    const newGrades = { ...student.grades };
                    newGrades[newSubjectName] = newGrades[selectedColumn];
                    delete newGrades[selectedColumn];
                    return calculateDerivedFields({
                      ...student,
                      grades: newGrades,
                    });
                  }
                  return student;
                });
                setStudents(updatedStudents);

                setShowEditColumnModal(false);
                setEditSubjectName("");
                setEditSubjectCode("");
                setSelectedColumn(null);
                toast.success("Subject updated successfully. Column renamed.");
                if (gradeManagementGridApi) {
                  gradeManagementGridApi.refreshCells({ force: true });
                }
              }}
              disabled={!editSubjectName.trim()}
            >
              Update Subject
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default StudentPerformance;
