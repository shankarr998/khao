import { gql } from '@apollo/client';

// Auth
export const GET_ME = gql`
  query GetMe {
    me {
      id
      email
      firstName
      lastName
      role
      avatarUrl
      createdAt
    }
  }
`;

export const LOGIN = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      user {
        id
        email
        firstName
        lastName
        role
        avatarUrl
      }
      token
    }
  }
`;

export const LOGOUT = gql`
  mutation Logout {
    logout
  }
`;

// Dashboard
export const GET_DASHBOARD_STATS = gql`
  query GetDashboardStats {
    dashboardStats {
      totalContacts
      totalCompanies
      totalDeals
      totalDealValue
      openDeals
      wonDeals
      lostDeals
      upcomingActivities
      overdueActivities
    }
    dealsByStage {
      stage
      count
      value
    }
  }
`;

// Contacts
export const GET_CONTACTS = gql`
  query GetContacts {
    contacts {
      id
      firstName
      lastName
      email
      phone
      jobTitle
      status
      company { id name }
      createdAt
    }
  }
`;

export const CREATE_CONTACT = gql`
  mutation CreateContact($input: CreateContactInput!) {
    createContact(input: $input) { id firstName lastName email }
  }
`;

export const UPDATE_CONTACT = gql`
  mutation UpdateContact($id: ID!, $input: UpdateContactInput!) {
    updateContact(id: $id, input: $input) { id firstName lastName email phone jobTitle status }
  }
`;

export const DELETE_CONTACT = gql`
  mutation DeleteContact($id: ID!) { deleteContact(id: $id) }
`;

// Companies
export const GET_COMPANIES = gql`
  query GetCompanies {
    companies {
      id
      name
      industry
      website
      size
      address
      createdAt
    }
  }
`;

export const CREATE_COMPANY = gql`
  mutation CreateCompany($input: CreateCompanyInput!) {
    createCompany(input: $input) { id name }
  }
`;

export const UPDATE_COMPANY = gql`
  mutation UpdateCompany($id: ID!, $input: UpdateCompanyInput!) {
    updateCompany(id: $id, input: $input) { id name industry website size address }
  }
`;

export const DELETE_COMPANY = gql`
  mutation DeleteCompany($id: ID!) { deleteCompany(id: $id) }
`;

// Deals
export const GET_DEALS = gql`
  query GetDeals {
    deals {
      id
      title
      value
      currency
      stage
      probability
      closeDate
      contact { id firstName lastName }
      company { id name }
      createdAt
    }
  }
`;

export const CREATE_DEAL = gql`
  mutation CreateDeal($input: CreateDealInput!) {
    createDeal(input: $input) { id title value stage }
  }
`;

export const UPDATE_DEAL = gql`
  mutation UpdateDeal($id: ID!, $input: UpdateDealInput!) {
    updateDeal(id: $id, input: $input) { id title value currency stage probability closeDate }
  }
`;

export const DELETE_DEAL = gql`
  mutation DeleteDeal($id: ID!) { deleteDeal(id: $id) }
`;

// Activities
export const GET_ACTIVITIES = gql`
  query GetActivities {
    activities {
      id
      type
      subject
      description
      dueDate
      completed
      completedAt
      contact { id firstName lastName }
      deal { id title }
      createdAt
    }
  }
`;

export const CREATE_ACTIVITY = gql`
  mutation CreateActivity($input: CreateActivityInput!) {
    createActivity(input: $input) { id type subject }
  }
`;

export const UPDATE_ACTIVITY = gql`
  mutation UpdateActivity($id: ID!, $input: UpdateActivityInput!) {
    updateActivity(id: $id, input: $input) { id type subject description dueDate completed }
  }
`;

export const DELETE_ACTIVITY = gql`
  mutation DeleteActivity($id: ID!) { deleteActivity(id: $id) }
`;
