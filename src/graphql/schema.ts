import gql from 'graphql-tag';

export const typeDefs = gql`
  # Enums
  enum ContactStatus {
    LEAD
    PROSPECT
    CUSTOMER
    CHURNED
  }

  enum CompanySize {
    STARTUP
    SMALL
    MEDIUM
    LARGE
    ENTERPRISE
  }

  enum DealStage {
    QUALIFICATION
    DISCOVERY
    PROPOSAL
    NEGOTIATION
    CLOSED_WON
    CLOSED_LOST
  }

  enum ActivityType {
    TASK
    CALL
    MEETING
    EMAIL
  }

  # Types
  type Contact {
    id: ID!
    firstName: String!
    lastName: String!
    email: String!
    phone: String
    jobTitle: String
    status: ContactStatus!
    company: Company
    deals: [Deal!]!
    activities: [Activity!]!
    notes: [Note!]!
    createdAt: String!
    updatedAt: String!
  }

  type Company {
    id: ID!
    name: String!
    industry: String
    website: String
    size: CompanySize
    address: String
    contacts: [Contact!]!
    deals: [Deal!]!
    createdAt: String!
    updatedAt: String!
  }

  type Deal {
    id: ID!
    title: String!
    value: Float!
    currency: String!
    stage: DealStage!
    probability: Int!
    closeDate: String
    contact: Contact
    company: Company
    activities: [Activity!]!
    notes: [Note!]!
    createdAt: String!
    updatedAt: String!
  }

  type Activity {
    id: ID!
    type: ActivityType!
    subject: String!
    description: String
    dueDate: String
    completed: Boolean!
    completedAt: String
    contact: Contact
    deal: Deal
    createdAt: String!
    updatedAt: String!
  }

  type Note {
    id: ID!
    content: String!
    contact: Contact
    deal: Deal
    createdAt: String!
    updatedAt: String!
  }

  # Auth Types
  type User {
    id: ID!
    email: String!
    firstName: String!
    lastName: String!
    role: String!
    avatarUrl: String
    createdAt: String!
  }

  type AuthPayload {
    user: User!
    token: String!
  }

  # Dashboard Types
  type DashboardStats {
    totalContacts: Int!
    totalCompanies: Int!
    totalDeals: Int!
    totalDealValue: Float!
    openDeals: Int!
    wonDeals: Int!
    lostDeals: Int!
    upcomingActivities: Int!
    overdueActivities: Int!
  }

  type DealsByStage {
    stage: DealStage!
    count: Int!
    value: Float!
  }

  # Inputs
  input CreateContactInput {
    firstName: String!
    lastName: String!
    email: String!
    phone: String
    jobTitle: String
    status: ContactStatus
    companyId: String
  }

  input UpdateContactInput {
    firstName: String
    lastName: String
    email: String
    phone: String
    jobTitle: String
    status: ContactStatus
    companyId: String
  }

  input CreateCompanyInput {
    name: String!
    industry: String
    website: String
    size: CompanySize
    address: String
  }

  input UpdateCompanyInput {
    name: String
    industry: String
    website: String
    size: CompanySize
    address: String
  }

  input CreateDealInput {
    title: String!
    value: Float!
    currency: String
    stage: DealStage
    probability: Int
    closeDate: String
    contactId: String
    companyId: String
  }

  input UpdateDealInput {
    title: String
    value: Float
    currency: String
    stage: DealStage
    probability: Int
    closeDate: String
    contactId: String
    companyId: String
  }

  input CreateActivityInput {
    type: ActivityType!
    subject: String!
    description: String
    dueDate: String
    contactId: String
    dealId: String
  }

  input UpdateActivityInput {
    type: ActivityType
    subject: String
    description: String
    dueDate: String
    completed: Boolean
    contactId: String
    dealId: String
  }

  input CreateNoteInput {
    content: String!
    contactId: String
    dealId: String
  }

  # Queries
  type Query {
    # Auth
    me: User
    
    # Dashboard
    dashboardStats: DashboardStats!
    dealsByStage: [DealsByStage!]!
    
    # Entities
    contacts: [Contact!]!
    contact(id: ID!): Contact
    companies: [Company!]!
    company(id: ID!): Company
    deals: [Deal!]!
    deal(id: ID!): Deal
    activities: [Activity!]!
    activity(id: ID!): Activity
    notes: [Note!]!
  }

  # Mutations
  type Mutation {
    # Auth
    login(email: String!, password: String!): AuthPayload!
    logout: Boolean!
    
    # Contacts
    createContact(input: CreateContactInput!): Contact!
    updateContact(id: ID!, input: UpdateContactInput!): Contact!
    deleteContact(id: ID!): Boolean!
    
    # Companies
    createCompany(input: CreateCompanyInput!): Company!
    updateCompany(id: ID!, input: UpdateCompanyInput!): Company!
    deleteCompany(id: ID!): Boolean!
    
    # Deals
    createDeal(input: CreateDealInput!): Deal!
    updateDeal(id: ID!, input: UpdateDealInput!): Deal!
    deleteDeal(id: ID!): Boolean!
    
    # Activities
    createActivity(input: CreateActivityInput!): Activity!
    updateActivity(id: ID!, input: UpdateActivityInput!): Activity!
    deleteActivity(id: ID!): Boolean!
    
    # Notes
    createNote(input: CreateNoteInput!): Note!
    deleteNote(id: ID!): Boolean!
  }
`;
