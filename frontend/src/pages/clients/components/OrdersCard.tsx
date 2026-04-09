import {
  OpenInNew as OpenInNewIcon,
  Receipt as ReceiptIcon,
} from '@mui/icons-material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useQuery } from '@tanstack/react-query';

import * as apiService from '@/src/services/backend-service';
import { ORDER_STATUS, OrderStatus } from '@/src/types/orders';

const STATUS_LABEL: Record<OrderStatus, string> = {
  [ORDER_STATUS.IN_PROGRESS]: 'In Arbeit',
  [ORDER_STATUS.DONE]: 'Fertig',
  [ORDER_STATUS.CANCELLED]: 'Abgebrochen',
};

function statusColor(
  status: string,
): 'warning' | 'success' | 'error' | 'default' {
  if (status === ORDER_STATUS.DONE) return 'success';
  if (status === ORDER_STATUS.IN_PROGRESS) return 'warning';
  if (status === ORDER_STATUS.CANCELLED) return 'error';
  return 'default';
}

type OrdersCardProps =
  | { clientId: number; carId?: never }
  | { carId: number; clientId?: never };

export default function OrdersCard({ clientId, carId }: OrdersCardProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['orders', 'preview', { clientId, carId }],
    queryFn: () => apiService.fetchOrders(0, 5, '', clientId, carId),
  });

  const orders = data?.data ?? [];
  const totalOrders = data?.meta.totalItems ?? 0;
  const hiddenCount = totalOrders - orders.length;
  const allOrdersHref = clientId
    ? `/orders?clientId=${clientId}`
    : `/orders?carId=${carId}`;

  return (
    <Card elevation={2}>
      <CardHeader
        title={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ReceiptIcon />
            <Typography variant="h6" component="h3" sx={{ fontWeight: 500 }}>
              Aufträge
            </Typography>
          </Box>
        }
        action={
          <Button
            component="a"
            href={allOrdersHref}
            target="_blank"
            rel="noopener noreferrer"
            variant="contained"
            color="secondary"
            startIcon={<ReceiptIcon />}
            size="small"
          >
            Alle anzeigen
          </Button>
        }
        sx={{ pb: 1 }}
      />
      <CardContent sx={{ pt: 0, '&:last-child': { pb: 1 } }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <CircularProgress size={24} />
          </Box>
        ) : orders.length === 0 ? (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ py: 2, textAlign: 'center' }}
          >
            Keine Aufträge vorhanden
          </Typography>
        ) : (
          <Box>
            {orders.map((order, i) => (
              <Box key={order.id}>
                {i > 0 && <Divider />}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    py: 0.75,
                    px: 0.5,
                  }}
                >
                  <Typography
                    variant="caption"
                    fontWeight={600}
                    sx={{ minWidth: 36, fontFamily: 'monospace' }}
                  >
                    {order.orderNumber}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      flex: 1,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {order.title}
                  </Typography>
                  <Chip
                    label={
                      STATUS_LABEL[order.status as OrderStatus] ?? order.status
                    }
                    color={statusColor(order.status)}
                    size="small"
                    sx={{ fontSize: '0.65rem', height: 18 }}
                  />
                  <Typography
                    variant="caption"
                    color="text.disabled"
                    sx={{ whiteSpace: 'nowrap' }}
                  >
                    {order.orderDate}
                  </Typography>
                  <Tooltip title="In neuem Tab öffnen">
                    <IconButton
                      component="a"
                      href={`/orders/${order.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      size="small"
                      sx={{ p: 0.25, color: 'action.active' }}
                    >
                      <OpenInNewIcon sx={{ fontSize: 14 }} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            ))}
          </Box>
        )}
        {hiddenCount > 0 && (
          <>
            <Divider />
            <Typography
              component="a"
              href={allOrdersHref}
              target="_blank"
              rel="noopener noreferrer"
              variant="caption"
              color="text.secondary"
              sx={{
                display: 'block',
                textAlign: 'center',
                py: 0.75,
                textDecoration: 'none',
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              + {hiddenCount} weitere
            </Typography>
          </>
        )}
      </CardContent>
    </Card>
  );
}
