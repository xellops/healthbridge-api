# Services

The service feature maintains a set of services offered by an organization at specific branches.

## System-generated and User-managed Services

Services can be system-generated with a `isSystemGenerated` flag. These records will not come with an `organizationId`, but will have the `isSystemGenerated` field set to true. The default value for this column is false though. This is useful for when organizations add a new service they offer.

#### Notes

- System-generated resources cannot be updated or deleted by a member of an organization!

## Service Status

Allowed values are `active` and `inactive`. If a service goes inactive, it means the service is no longer available in the system (for system-generated) or at the organization (for user-managed).

## Branch Services

A service an be available at multiple branches or only in a few branches of a business. Now this is extremely important. Each branch has controls it's own price and availability of a service. For instance, maternity service may be available in one branch of a hospital, but unavailable in a different branch. So this is crucial!

#### Notes

- branch service must have a `status` with possible values `active` and `inactive`
- branch service maintains its own price
