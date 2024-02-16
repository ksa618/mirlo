import { css } from "@emotion/css";
import Modal from "components/common/Modal";
import Money from "components/common/Money";
import Table from "components/common/Table";
import React from "react";
import { Outlet, useNavigate, useParams } from "react-router-dom";
import api from "services/api";

interface AdminSubscription extends ArtistUserSubscription {
  user: User;
}

export const AdminSubscriptions: React.FC = () => {
  const navigate = useNavigate();
  const { trackgroupId } = useParams();
  const [results, setResults] = React.useState<AdminSubscription[]>([]);
  const [openModal, setOpenModal] = React.useState(false);

  React.useEffect(() => {
    const callback = async () => {
      const { results } = await api.getMany<AdminSubscription>(
        "admin/subscriptions?orderBy=createdAt"
      );
      setResults(results);
    };
    callback();
  }, []);

  React.useEffect(() => {
    if (trackgroupId) {
      setOpenModal(true);
    }
  }, [trackgroupId]);

  const total = results.reduce((aggr, r) => {
    if (aggr[r.currency]) {
      aggr[r.currency] += r.amount;
    } else {
      aggr[r.currency] = r.amount;
    }
    return aggr;
  }, {} as any);

  return (
    <div
      className={css`
        flex-grow: 1;
      `}
    >
      <h3>Subscriptions</h3>

      <h4>Totals</h4>
      <Table
        className={css`
          margin-bottom: 2rem;
        `}
      >
        <thead>
          <tr>
            <th>Currency</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {Object.keys(total).map((currency) => (
            <tr key={currency}>
              <td>{currency}</td>
              <Money amount={total[currency] / 100} />
            </tr>
          ))}
        </tbody>
      </Table>

      {results.length > 0 && (
        <Table>
          <thead>
            <tr>
              <th />
              <th>User</th>
              <th>Subscription</th>
              <th>Artist</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {results.map((sub, index) => (
              <tr key={sub.artistSubscriptionTierId + sub.userId}>
                <td>{index + 1}</td>

                <td>
                  {sub.user.email} (userId: {sub.userId})
                </td>
                <td>
                  {sub.artistSubscriptionTier.name} (id:{" "}
                  {sub.artistSubscriptionTier.id})
                </td>
                <td>
                  {sub.artistSubscriptionTier.artist.name} (id:{" "}
                  {sub.artistSubscriptionTier.artist.id})
                </td>
                <td>
                  <Money amount={sub.amount / 100} currency={sub.currency} />
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
      {/* <LoadingButton /> */}
      <Modal
        open={openModal}
        onClose={() => {
          setOpenModal(false);
          navigate("/admin/trackgroups");
        }}
      >
        <Outlet />
      </Modal>
    </div>
  );
};

export default AdminSubscriptions;
